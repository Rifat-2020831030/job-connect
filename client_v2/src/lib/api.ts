const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchFeaturedJobs(section: "featured" | "engineering" | "leadership") {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/featured?section=${section}`, {
      // Revalidate every hour, or use no-store for completely dynamic
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch ${section} jobs: ${res.statusText}`);
      return [];
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(`Error fetching ${section} jobs:`, error);
    return [];
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/categories`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.statusText}`);
      return [];
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
