import { Inngest } from 'inngest';

export const inngestClient = new Inngest({ id: 'movie-ticket-booking' });

const syncUserCreation = inngestClient.createFunction(
  { name: 'Sync-user-from-clerk'},
  { event: 'clerk/user.created' },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url} = event.data
    const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + ' ' + last_name,
        image: image_url
  }
  await User.create(userData)
}
)

const syncUserDeletion = inngestClient.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

const syncUserUpdation = inngestClient.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({ event })=>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }  
        await User.findByIdAndUpdate(id, userData)
    }
)

export const functions = [syncUserCreation, syncUserDeletion];


