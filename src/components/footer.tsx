import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center gap-4 pb-4">
      <div className="flex flex-row justify-between">
        <ul className="flex flex-wrap justify-center gap-4">
          <li className="dark:text-muted-foreground dark:hover:text-foreground">
            <Link href="#">Terms of Service</Link>
          </li>
          <li className="dark:text-muted-foreground dark:hover:text-foreground">
            •
          </li>
          <li className="dark:text-muted-foreground dark:hover:text-foreground cursor-pointer">
            <Link href="#">Privacy Policy</Link>
          </li>
        </ul>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Framer Deploy. All rights reserved.
          <p className="p-8">
            Built with ❤️ By Sarthak Kapila
          </p>
        </p>
      </div>
    </footer>
  );
}
