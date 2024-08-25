import { EventMZWO } from "../../type/mzwo";

export const sortEvents = (
  events: EventMZWO[],
  sortFilter: string,
  direction: string
) => {
  if (sortFilter === "availableFoodQuantity") {
    return events.slice().sort((a, b) => {
      if (direction === "ascending") {
        return a.availableFoodQuantity - b.availableFoodQuantity;
      } else if (direction === "descending") {
        return b.availableFoodQuantity - a.availableFoodQuantity;
      }
      return 0;
    });
  } else if (sortFilter === "availableSlots") {
    return events.slice().sort((a, b) => {
      if (direction === "ascending") {
        return a.availableSlots - b.availableSlots;
      } else if (direction === "descending") {
        return b.availableSlots - a.availableSlots;
      }
      return 0;
    });
  } else if (sortFilter === "maxParticipants") {
    return events.slice().sort((a, b) => {
      if (direction === "ascending") {
        return a.maxParticipants - b.maxParticipants;
      } else if (direction === "descending") {
        return b.maxParticipants - a.maxParticipants;
      }
      return 0;
    });
  } else {
    return events;
  }
};
