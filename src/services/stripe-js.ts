import { loadStripe } from '@stripe/stripe-js'

export async function getStripeJs() {
    const stripeJs = await loadStripe('pk_test_51IkVbcDvJg6uMqJbU7OBlQZ35bjYAt5SrF5COrEyyEUB8IOS2gFhokhyPsk9cq3ulr1WMptbZ10L9sk0unI33TN7008UxAZna3')

    return stripeJs
    
}