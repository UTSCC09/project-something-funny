import Navbar from "../components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div style={mainContainerStyle}>
      <Navbar />
      <main style={mainContentStyle}>
        <h1 style={welcomeStyle}>Welcome to the University of Toronto Grand Library</h1>
        <p style={descriptionStyle}>
          Your central hub for course resources, collaboration, and community at U of T.
        </p>

        <section style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>About Our Platform</h2>
          <p style={sectionContentStyle}>
            The University of Toronto Grand Library is an online platform designed to enhance your
            learning experience. Here, you can explore detailed course information, access shared
            resources, and collaborate with fellow students in real-time. This is more than just a
            database—it’s a vibrant, interactive community.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Key Features</h2>
          <ul style={featuresListStyle}>
            <li><strong>Comprehensive Course Database:</strong> Browse courses, view descriptions, and access lecture materials, assignments, and tests.</li>
            <li><strong>Real-Time Collaboration:</strong> Work together on documents, add comments, and make annotations.</li>
            <li><strong>Community Engagement:</strong> Interact with peers, share notes, and contribute to community knowledge.</li>
            <li><strong>Multimedia Support:</strong> Upload and view files, videos, and images; add timestamped comments on videos for precise discussions.</li>
            <li><strong>Secure and Controlled Access:</strong> Control who can view or edit documents, ensuring a safe and productive environment.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Get Started</h2>
          <p style={startMessageStyle}>To begin exploring the Grand Library, register or log in through the navbar above.</p>
        </section>
      </main>
    </div>
  );
}

// Styles
const mainContainerStyle = {
  background: 'linear-gradient(to bottom, #00567d, #e1f1f6)', // U of T blue gradient
  minHeight: '100vh',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
};

const mainContentStyle = {
  padding: '3rem 1rem',
  textAlign: 'center',
  color: '#333',
};

const welcomeStyle = {
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#00567d', // U of T blue color
  marginBottom: '1rem',
};

const descriptionStyle = {
  fontSize: '1.5rem',
  color: '#444',
  marginBottom: '2rem',
};

const sectionStyle = {
  marginTop: '2rem',
};

const sectionHeaderStyle = {
  fontSize: '2rem',
  color: '#00567d',
  marginBottom: '1rem',
};

const sectionContentStyle = {
  fontSize: '1.2rem',
  color: '#555',
  lineHeight: '1.6',
  maxWidth: '800px',
  margin: 'auto',
};

const featuresListStyle = {
  listStyle: 'none',
  padding: 0,
  fontSize: '1.1rem',
  color: '#555',
  textAlign: 'left',
  maxWidth: '800px',
  margin: 'auto',
};

const startMessageStyle = {
  fontSize: '1.2rem',
  color: '#555',
};
