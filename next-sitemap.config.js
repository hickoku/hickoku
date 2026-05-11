/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hickoku.com', // Replace with your actual domain
    generateRobotsTxt: true, // Generate robots.txt
    generateIndexSitemap: false, // Set to true if you have 1000+ pages
    exclude: ['/admin/*', '/api/*', '/checkout/success', '/checkout/confirmation'], // Pages to exclude
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout/success', '/checkout/confirmation'],
            },
        ],
    },
}