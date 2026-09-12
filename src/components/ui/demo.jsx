import React from 'react';
import ResponsiveHeroBanner from './responsive-hero-banner';

const HeroDemo = () => {
    return (
        <ResponsiveHeroBanner
            badgeLabel="NEW"
            badgeText="The AI-Powered Visual Workspace"
            title="See how teams get"
            titleLine2="great done with CLYS"
            description="The AI-powered visual workspace for innovation, collaboration, and learning. Design custom quizzes, participate in educational contests, and turn ideas into academic excellence."
            primaryButtonText="Get started free"
            secondaryButtonText="Book a demo"
            ctaButtonText="Get Started"
            partnersTitle="Trusted by learners & educators across top universities"
        />
    );
};

export default HeroDemo;
