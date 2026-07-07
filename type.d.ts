import type { ImageSourcePropType } from "react-native";

declare global {
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
    tourDescription: string;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon?: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    frequency?: string;
    renewalDate?: string;
    color?: string;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface ListHeadingProps {
    title: string;
  }
  export type SubscriptionStatus = "active" | "paused" | "cancelled";

//   export interface Subscription {
//     id: string;
//     icon: ImageSourcePropType;
//     name: string;
//     plan?: string;
//     category?: string;
//     paymentMethod?: string;
//     startDate?: string;
//     price: number;
//     currency?: string;
//     billing: string;
//     frequency?: string;
//     renewalDate?: string;
//     color?: string;
//     status: SubscriptionStatus;
//     notes?: string;
//     icon_id?: string | null;
//     icon_color?: string | null;
//     icon_initials?: string | null;
//   }
// }

 interface Subscription {
  id: string;
  icon: ImageSourcePropType;
  service_name: string;
  plan?: string;
  category?: string;
  payment_method?: string;
  start_date?: string;
  amount: number;
  currency_code?: string;
  billing_cycle: string;
  next_renewal_date?: string;
  color?: string;
  status: SubscriptionStatus;
  notes?: string;
  icon_id?: string | null;
  icon_color?: string | null;
  icon_initials?: string | null;
  notifications?: string[];
  notifications_enabled?: boolean;
}

export { Subscription, SubscriptionStatus };
