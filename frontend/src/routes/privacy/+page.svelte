<script lang="ts">
  import { Shield } from 'lucide-svelte';

  const sections = [
    {
      title: '1. Information We Collect',
      body: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, payment information (processed securely via our payment provider — we never store card numbers), and order history.

We also automatically collect certain information when you use our services, including your IP address, browser type, device identifiers, pages visited, and referring URLs. This helps us improve the platform and detect fraud.`
    },
    {
      title: '2. How We Use Your Information',
      body: `We use the information we collect to process and fulfil your orders, send order confirmations and shipping updates, provide customer support, personalise your shopping experience and recommendations, send marketing communications (only if you opt in), detect and prevent fraud and abuse, and comply with legal obligations.`
    },
    {
      title: '3. Sharing Your Information',
      body: `We do not sell your personal information. We share your data only with trusted partners necessary to deliver our services: payment processors (Stripe), shipping carriers (UPS, FedEx, DHL), cloud infrastructure providers (AWS), and analytics providers under strict confidentiality agreements. We may also share information when required by law or to protect our rights and the safety of our users.`
    },
    {
      title: '4. Cookies & Tracking',
      body: `We use cookies and similar technologies to keep you signed in, remember your preferences, understand how you use our site, and serve relevant advertisements. You can control cookie settings through your browser. Disabling cookies may affect some features of the site.`
    },
    {
      title: '5. Data Security',
      body: `We use industry-standard security measures including 256-bit SSL/TLS encryption for all data in transit, encrypted storage for sensitive data at rest, regular security audits and penetration testing, and strict access controls for our team. No system is 100% secure, but we take every reasonable precaution to protect your data.`
    },
    {
      title: '6. Your Rights',
      body: `Depending on your location, you may have the right to access, correct, or delete your personal information; withdraw consent for marketing at any time; request a copy of the data we hold about you; opt out of targeted advertising; and lodge a complaint with your local data protection authority. To exercise any of these rights, contact us at privacy@nexmart.com.`
    },
    {
      title: '7. Data Retention',
      body: `We retain your personal information for as long as your account is active or as needed to provide services. If you close your account, we will delete or anonymise your personal data within 90 days, except where we are required to retain it by law (e.g., financial records for 7 years).`
    },
    {
      title: '8. Children\'s Privacy',
      body: `NEXMART is not directed at children under 13. We do not knowingly collect personal information from children. If we learn we have collected data from a child under 13, we will promptly delete it. If you believe we have such data, please contact us immediately.`
    },
    {
      title: '9. Changes to This Policy',
      body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a prominent notice on our site. Your continued use of NEXMART after changes take effect constitutes acceptance of the updated policy.`
    },
    {
      title: '10. Contact Us',
      body: `If you have questions or concerns about this Privacy Policy or how we handle your data, please contact our Privacy Team at privacy@nexmart.com or write to us at: NEXMART Privacy Team, 123 Commerce Street, New York, NY 10001.`
    },
  ];
</script>

<svelte:head><title>Privacy Policy — NEXMART</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-14">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <Shield class="w-4 h-4" /> Legal
    </div>
    <h1 class="text-5xl font-black mb-4">Privacy <span class="gradient-text">Policy</span></h1>
    <p class="text-gray-400">Last updated: June 19, 2026 · Effective immediately</p>
  </div>

  <div class="glass rounded-2xl p-4 border border-indigo-500/20 mb-10 flex items-start gap-3">
    <Shield class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
    <p class="text-sm text-gray-300">
      <strong>Your privacy matters.</strong> We are committed to being transparent about how we collect, use, and protect your personal information.
    </p>
  </div>

  <div class="space-y-8">
    {#each sections as section}
      <div class="glass rounded-2xl p-7 border border-white/5">
        <h2 class="text-lg font-bold mb-3 text-white">{section.title}</h2>
        <p class="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
      </div>
    {/each}
  </div>

  <div class="mt-10 text-center text-gray-500 text-sm">
    Questions? <a href="/contact" class="text-indigo-400 hover:text-indigo-300 transition-colors">Contact us</a> or email privacy@nexmart.com
  </div>
</div>
