import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <Link href="/dashboard">Go to Dashboard</Link>
    </div>
  );
}
