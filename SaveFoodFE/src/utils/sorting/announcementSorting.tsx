import { AnnouncementMZWO } from "../../type/mzwo";

export const sortAnnouncements = (
  announcements: AnnouncementMZWO[],
  sortingDirection: string
) => {
  const sortedAnnouncements = announcements.slice();

  sortedAnnouncements.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    if (sortingDirection === "newest") {
      return dateB - dateA;
    } else if (sortingDirection === "oldest") {
      return dateA - dateB;
    } else {
      return 0;
    }
  });

  return sortedAnnouncements;
};
