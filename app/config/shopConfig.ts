export const SHOP_CONFIG = {
  isEnabled: true, // Zet op true om shop te activeren
  maintenanceMessage: {
    title: "Webshop Coming Soon",
    description: "Our webshop is currently under construction. We're working hard to bring you an amazing selection of whiskies for charity.",
    subtitle: "Please check back soon!"
  }
} as const

// Type definities voor type safety
export type ShopConfig = typeof SHOP_CONFIG 