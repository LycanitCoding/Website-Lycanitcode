import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Me</h1>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h2>Welcome</h2>
          <p>
            I'm Lycanit Coding, an aspiring full stack developer with a passion for building modern web applications. Thus far I have worked for 5 years in the IT industry, starting as a field technician and working my way up to my current position as a desktop analyst. Recently I have begun to focus on a transition into an software develpment and automations role to pursue my passion for coding and creating innovative solutions. I am excited to share my progress, projects, and skills with you through this portfolio website. Thank you for visiting!
          </p>
        </div>

        <div className="about-section">
          <h2>Skills</h2>
          <div className="skills-grid">
            <div className="skill-card">
              <h3>Frontend</h3>
              <ul>
                <li>React & React Router</li>
                <li>JavaScript ES6+</li>
                <li>CSS3 & Responsive Design</li>
                <li>REST API Integration</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>Backend</h3>
              <ul>
                <li>Node.js & Express</li>
                <li>RESTful APIs</li>
                <li>Authentication & Authorization</li>
                <li>Database Design</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>Infrastructure</h3>
              <ul>
                <li>Docker & Docker Compose</li>
                <li>Nginx Web Server</li>
                <li>AWS Deployment</li>
                <li>PostgreSQL Database</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Experience</h2>
          <div className="experience-item">
            <h3>Desktop Analyst</h3>
            <p className="experience-meta">Present</p>
            <p>
              Providing technical support and troubleshooting for end-users, managing software deployments, and maintaining IT infrastructure to ensure smooth operations.
            </p>
          </div>
          <div className="experience-item">
            <h3>Service Desk Technician 1</h3>
            <p className="experience-meta">12/2023 - 10/2025</p>
            <p>
              Assisting end-users with technical issues, providing remote support, and troubleshooting hardware and software problems.
            </p>
          </div>
          <div className="experience-item">
            <h3>IT Specialist</h3>
            <p className="experience-meta">12/2022 - 10/2023</p>
            <p>
              Assisting end-users with technical issues, managinge data ingestion and processing, and providing support for various IT systems and applications.
            </p>
          </div>
          <div className="experience-item">
            <h3>Field Technician</h3>
            <p className="experience-meta">11/2020 - 11/2022</p>
            <p>
              Setting up communication equipment, troubleshooting network issues, and providing on-site technical support to ensure reliable connectivity for sites.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h2>Education</h2>
          <div className="education-item">
            <h3>WGU</h3>
            <p>
              Currently enrolled in Comuter Science
            </p>
          </div>
          <div className="education-item">
            <h3>Self-Taught Developer</h3>
            <p>
              Continuously learning and improving my skills through practical projects and staying updated with the latest technologies.
            </p>
          </div>
          <div className="education-item">
            <h3>Certifications</h3>
            <p>
              A+ Certified, Network+ Certified, Security+ Certified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
