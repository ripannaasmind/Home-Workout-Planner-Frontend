import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Workouts } from "@/components/home/Workouts";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Workouts />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
