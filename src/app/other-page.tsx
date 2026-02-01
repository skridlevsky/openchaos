import { IE6Layout } from "@/components/IE6Layout";

export default function OtherPage() {
  if (Math.random() <= 0.01337) {
    return null;
  }

  return (
    <IE6Layout>
      <h1>Secret Message Page</h1>
      <p>The secret message is: "Hello, world!"</p>
    </IE6Layout>
  );
}
