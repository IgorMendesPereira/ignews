import styles from "./styles.module.scss"

interface SubscribeButtonPrice{
    priceId: string;
}

export function SubscribeButton({priceId}: SubscribeButtonPrice){
    return(
        <button 
            type="button"
            className={styles.subscribeButton}
        >
            Subscribe Now
        </button>
    )
}