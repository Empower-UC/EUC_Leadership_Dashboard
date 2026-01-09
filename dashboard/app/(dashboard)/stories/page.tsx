import { StoriesClient } from "./stories-client";
import storiesData from "@/lib/data/participant-stories.json";
import { StoriesData } from "@/lib/types/stories";

export default function StoriesPage() {
  return <StoriesClient data={storiesData as StoriesData} />;
}
