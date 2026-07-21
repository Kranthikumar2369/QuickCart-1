import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({
  id: "quickcart-next",
});

// User Created
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    on: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await connectDB();

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      imageUrl: image_url,
    });
  }
);

// User Updated
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    on: {
      event: "clerk/user.updated",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await connectDB();

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      imageUrl: image_url,
    });
  }
);

// User Deleted
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    on: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    await connectDB();

    await User.findByIdAndDelete(event.data.id);
  }
);