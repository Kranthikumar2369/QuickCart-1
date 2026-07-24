import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({
  id: "quickcart-next",
});

// User Created
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [
      {
        event: "clerk/user.created",
      },
    ],
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
    triggers: [
      {
        event: "clerk/user.updated",
      },
    ],
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
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    await connectDB();

    await User.findByIdAndDelete(event.data.id);
  }
);



//Inngest Function to create user's order in database
export const createUserOrder = inngest.createFunction(
  {
    id:'create-user-order',
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    }
  },
  {event: 'order/created'},
  async ({events}) => {

    const orders = events.map((event)=>{
      return{
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date
      }

    })

  await connectDB()
  await Order.insertMany(orders)

  return {success: true, processed: orders.length};

  }
)