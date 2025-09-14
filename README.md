# ExportNoCode

A tool that lets you export no‑code websites easily — starting with Framer.

## Features

- **Easy Downloads**: Download HTML files from supported no‑code sites by simply entering the URL
- **No Coding Required**: User-friendly interface for non-technical users
- **Fast Processing**: Quickly extract website files with a single click
- **Deploy Anywhere (Coming Soon)**: Deploy to any hosting provider with one-click deployment
- **Custom Domain Support (Coming Soon)**: Use your own domain for deployed mirrors
- **Analytics Integration (Coming Soon)**: Track visitor data on your deployed sites

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm, npm, or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/weknowyourgame/framer-deploy.git
cd framer-deploy
```

2. Install dependencies
```bash
bun install
```

3. Start the development server
```bash
bun dev # For Next.js frontend
bun api:dev # For Express API server
```

The Next.js application should now be running on `http://localhost:3000` and the Express API on `http://localhost:3001`.

## How to Use

1. Enter the URL of any supported website in the input field (e.g., mysite.framer.website)
2. Click the "Download" button
3. The application will process the website and provide downloadable HTML files
4. (Coming soon) Choose a hosting provider to deploy your website

## Tech Stack

- Next.js 15
- React 19
- Express.js (API server)
- TailwindCSS
- TypeScript

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.