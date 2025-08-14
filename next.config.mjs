/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Use subpath only for GitHub Pages builds
  basePath: isGithubPages && repo ? `/${repo}` : undefined,
  assetPrefix: isGithubPages && repo ? `/${repo}/` : undefined,
}

export default nextConfig