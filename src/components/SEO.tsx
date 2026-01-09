import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    article?: boolean;
    noIndex?: boolean;
}

export function SEO({
    title,
    description,
    image = 'https://co-found.uz/og-image.png', // Default OG image
    article = false,
    noIndex = false
}: SEOProps) {
    const location = useLocation();
    const siteUrl = 'https://co-found.uz';
    const url = `${siteUrl}${location.pathname}`;
    const fullTitle = `${title} | Co-found.uz`;

    // Structured Data (JSON-LD)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Co-found.uz",
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Co-found.uz",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`, // Assuming a logo exists or wil exist
        "sameAs": [] // Add social links here if available
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:url" content={url} />
            <meta property="og:type" content={article ? 'article' : 'website'} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Schemas */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(orgSchema)}
            </script>
        </Helmet>
    );
}
