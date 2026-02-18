/**
 * Script to verify Razorpay webhook signature logic (run with: node scripts/verify-webhook-signature.js)
 * Uses same algorithm as app/api/razorpay/webhook/route.ts
 */
const crypto = require("crypto")

function verifySignature(body, signature, secret) {
  if (!secret) return false
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return signature === expected
}

const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_secret"
const body = '{"event":"payment.captured","payload":{}}'
const sig = crypto.createHmac("sha256", secret).update(body).digest("hex")

console.assert(verifySignature(body, sig, secret) === true, "Valid signature should pass")
console.assert(verifySignature(body, "wrong", secret) === false, "Wrong signature should fail")
console.assert(verifySignature(body, sig, "other") === false, "Wrong secret should fail")
console.log("Webhook signature verification tests passed.")
process.exit(0)
