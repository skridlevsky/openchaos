import { fetchPRsByAuthor } from "@/lib/prData";
import { Web2UserProfile } from "@/components/profile/Web2UserProfile";
import { Web2Layout } from "@/components/Web2Layout";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Web2UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const result = await fetchPRsByAuthor(username);

  if (!result.ok) {
    return (
      <Web2Layout>
        <div className="page-container">
          <p>{result.error}</p>
          <a href="/web2">← Back to OpenChaos</a>
        </div>
      </Web2Layout>
    );
  }

  const { open, merged } = result.data;

  return (
    <Web2Layout>
      <Web2UserProfile
        username={username}
        openPRs={open}
        mergedPRs={merged}
        homeHref="/web2"
        homeLabel="← Back to OpenChaos"
      />
    </Web2Layout>
  );
}
