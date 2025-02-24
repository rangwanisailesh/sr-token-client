import { HomeComp } from "@/components/home";

export const metadata = {
  title : 'SRT Token',
  description: 'Claim free SRT Token after every 6 hours.',
  icons: {
    icon: '/logo.png'
  }
}

export default function Home() {
  return (
   <div>
      <HomeComp />
   </div>
  );
}
