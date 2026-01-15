<script lang="ts">
    import { Shield, Lock, Eye, Database, Cookie, Mail } from "lucide-svelte";
</script>

<svelte:head>
    <title>Privacy Policy - TVDom</title>
</svelte:head>

<div class="privacy-page">
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="icon-wrapper">
                <Shield class="w-12 h-12" />
            </div>
            <h1>Privacy Policy</h1>
            <p class="last-updated">Last updated: January 2025</p>
        </div>

        <!-- Introduction -->
        <section class="section">
            <p class="intro">
                At TVDom, we take your privacy seriously. This policy explains what information we collect, 
                how we use it, and your rights regarding your data.
            </p>
        </section>

        <!-- Information We Collect -->
        <section class="section">
            <div class="section-header">
                <Database class="section-icon" />
                <h2>Information We Collect</h2>
            </div>
            
            <h3>Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
                <li>Username and display name</li>
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Profile picture and banner (optional)</li>
            </ul>

            <h3>Usage Data</h3>
            <p>We automatically collect:</p>
            <ul>
                <li>Movies and TV shows you rate or add to your watchlist</li>
                <li>Your viewing history</li>
                <li>Social interactions (follows, comments, likes)</li>
                <li>Theme preferences</li>
            </ul>
        </section>

        <!-- How We Use Your Information -->
        <section class="section">
            <div class="section-header">
                <Eye class="section-icon" />
                <h2>How We Use Your Information</h2>
            </div>
            
            <p>We use your information to:</p>
            <ul>
                <li>Provide and improve our services</li>
                <li>Personalize your experience</li>
                <li>Send notifications about activity on your account</li>
                <li>Communicate important updates</li>
                <li>Maintain security and prevent abuse</li>
            </ul>
        </section>

        <!-- Data Storage -->
        <section class="section">
            <div class="section-header">
                <Lock class="section-icon" />
                <h2>Data Storage & Security</h2>
            </div>
            
            <p>
                Your data is stored securely in MongoDB databases. We use industry-standard 
                encryption for passwords and implement security measures to protect your information.
            </p>
            <p>
                Profile images are stored on Cloudinary's secure servers. We do not store payment 
                information as TVDom is currently a free service.
            </p>
        </section>

        <!-- Cookies -->
        <section class="section">
            <div class="section-header">
                <Cookie class="section-icon" />
                <h2>Cookies & Local Storage</h2>
            </div>
            
            <p>We use cookies and local storage to:</p>
            <ul>
                <li>Keep you logged in</li>
                <li>Remember your theme preference</li>
                <li>Improve site performance</li>
            </ul>
            <p>
                You can disable cookies in your browser settings, but this may affect site functionality.
            </p>
        </section>

        <!-- Third-Party Services -->
        <section class="section">
            <h2>Third-Party Services</h2>
            
            <h3>The Movie Database (TMDB)</h3>
            <p>
                We use TMDB's API to fetch movie and TV show information. When you search or browse content, 
                requests are made to TMDB's servers. Please review 
                <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" class="link">
                    TMDB's privacy policy
                </a>.
            </p>

            <h3>Cloudinary</h3>
            <p>
                Profile images and banners are uploaded to Cloudinary. Review their 
                <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" class="link">
                    privacy policy
                </a>.
            </p>
        </section>

        <!-- Your Rights -->
        <section class="section">
            <h2>Your Rights</h2>
            
            <p>You have the right to:</p>
            <ul>
                <li><strong>Access</strong> your data through your profile settings</li>
                <li><strong>Update</strong> your information at any time</li>
                <li><strong>Delete</strong> your account and associated data</li>
                <li><strong>Control</strong> your privacy settings (public/private profile)</li>
                <li><strong>Opt-out</strong> of notifications</li>
            </ul>
        </section>

        <!-- Data Sharing -->
        <section class="section">
            <h2>Data Sharing</h2>
            
            <p>
                We do not sell your personal information. Your data is only visible to other users 
                based on your privacy settings:
            </p>
            <ul>
                <li><strong>Public profiles:</strong> Visible to all users</li>
                <li><strong>Private profiles:</strong> Only you can see your activity</li>
            </ul>
            <p>
                We may share anonymized, aggregated data for analytics purposes.
            </p>
        </section>

        <!-- Children's Privacy -->
        <section class="section">
            <h2>Children's Privacy</h2>
            
            <p>
                TVDom is not intended for users under 13 years of age. We do not knowingly collect 
                information from children under 13.
            </p>
        </section>

        <!-- Changes to Policy -->
        <section class="section">
            <h2>Changes to This Policy</h2>
            
            <p>
                We may update this privacy policy from time to time. We will notify users of significant 
                changes via email or site notification.
            </p>
        </section>

        <!-- Contact -->
        <section class="section contact-section">
            <div class="section-header">
                <Mail class="section-icon" />
                <h2>Contact Us</h2>
            </div>
            
            <p>
                If you have questions about this privacy policy or your data, please contact us through 
                our <a href="https://github.com/haider-9" target="_blank" rel="noopener noreferrer" class="link">GitHub</a>.
            </p>
        </section>
    </div>
</div>

<style>
    .privacy-page {
        min-height: 100vh;
        padding: 4rem 0;
    }

    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .header {
        text-align: center;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid hsl(var(--border));
    }

    .icon-wrapper {
        display: inline-flex;
        padding: 1rem;
        background: hsl(var(--primary) / 0.1);
        border-radius: 1rem;
        color: hsl(var(--primary));
        margin-bottom: 1.5rem;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: hsl(var(--foreground));
        margin-bottom: 0.5rem;
    }

    .last-updated {
        font-size: 0.875rem;
        color: hsl(var(--muted-foreground));
    }

    .intro {
        font-size: 1.125rem;
        line-height: 1.7;
        color: hsl(var(--muted-foreground));
        margin-bottom: 2rem;
    }

    .section {
        margin-bottom: 3rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .section-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: hsl(var(--primary));
    }

    h2 {
        font-size: 1.75rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin: 1.5rem 0 0.75rem;
    }

    p {
        font-size: 1rem;
        line-height: 1.7;
        color: hsl(var(--muted-foreground));
        margin-bottom: 1rem;
    }

    ul {
        list-style: disc;
        padding-left: 1.5rem;
        margin: 1rem 0;
    }

    li {
        font-size: 1rem;
        line-height: 1.7;
        color: hsl(var(--muted-foreground));
        margin-bottom: 0.5rem;
    }

    strong {
        font-weight: 600;
        color: hsl(var(--foreground));
    }

    .link {
        color: hsl(var(--primary));
        text-decoration: underline;
    }

    .link:hover {
        text-decoration: none;
    }

    .contact-section {
        padding: 2rem;
        background: hsl(var(--muted) / 0.3);
        border-radius: 0.75rem;
        border: 1px solid hsl(var(--border));
    }

    @media (max-width: 640px) {
        .privacy-page {
            padding: 2rem 0;
        }

        h1 {
            font-size: 2rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        h3 {
            font-size: 1.125rem;
        }
    }
</style>
