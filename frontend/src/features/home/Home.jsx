import React from "react";

import Navbar from '../../components/layout/Navbar/Navbar';
import HeroBanner from "./HeroBanner";
import HowItWorks from "./HowItWorks";
import AudienceCard from "./AudienceCards";
import Footer from "../../components/layout/Footer/Footer";

const Home = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <HeroBanner />

      <HowItWorks />

        <AudienceCard />

        <Footer />
    </main>
  );
};

export default Home;