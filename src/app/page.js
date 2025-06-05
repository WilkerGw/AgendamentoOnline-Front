
import Image from "next/image";
import styles from "./page.module.css";
import AppointmentForm from "@/components/AppointmentForm/AppointmentForm"; // Import the form component

export default function Home() {
  return (
    <main className={styles.main}>
      {/* You can add other page content here if needed */}
      <AppointmentForm /> {/* Render the form component */}
    </main>
  );
}

