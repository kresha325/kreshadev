import { Router, type IRouter } from "express";
import { checkSameOrigin } from "../lib/admin-auth";
import { addContactMessage } from "../lib/contact-store";

const router: IRouter = Router();
const submissions = new Map<string, { count: number; resetAt: number }>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (request, response, next) => {
  try {
    if (!checkSameOrigin(request)) {
      response.status(403).json({ error: "Kërkesa duhet të dërgohet nga kjo faqe." });
      return;
    }

    const body = request.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      response.status(400).json({ error: "Forma nuk është e plotë." });
      return;
    }
    if (typeof body.website === "string" && body.website.trim()) {
      response.status(202).json({ ok: true });
      return;
    }

    const now = Date.now();
    const key = request.ip;
    const current = submissions.get(key);
    if (current && current.resetAt > now && current.count >= 5) {
      response.status(429).json({ error: "U dërguan shumë kërkesa. Provo përsëri pas pak." });
      return;
    }
    if (!current || current.resetAt <= now) submissions.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    else submissions.set(key, { ...current, count: current.count + 1 });

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const countryCode = typeof body.countryCode === "string" ? body.countryCode.trim() : "";
    const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!name || name.length > 100) {
      response.status(400).json({ error: "Shkruaj emrin (maksimumi 100 karaktere)." });
      return;
    }
    if (!email || email.length > 254 || !emailPattern.test(email)) {
      response.status(400).json({ error: "Shkruaj një adresë emaili të vlefshme." });
      return;
    }
    if (!/^\+[0-9-]{1,8}$/.test(countryCode) || !/^[0-9 ()-]{5,20}$/.test(phone)) {
      response.status(400).json({ error: "Shkruaj një numër telefoni të vlefshëm dhe prefiksin e shtetit." });
      return;
    }
    if (!projectType || projectType.length > 80) {
      response.status(400).json({ error: "Zgjidh llojin e projektit." });
      return;
    }
    if (!message || message.length > 5000) {
      response.status(400).json({ error: "Përshkruaje projektin (maksimumi 5000 karaktere)." });
      return;
    }

    await addContactMessage({ name, email, phone: `${countryCode} ${phone}`, projectType, message });
    response.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
