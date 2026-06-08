const AllOrdersSettings: WidgetSettings = {
    columns: [
      { key: 'customer', label: 'Customer', link: true, width: '2fr' },
      { key: 'totalPallets', label: 'Pallets' },
      { key: 'totalWeight', label: 'Weight' },
      { key: 'totalVolume', label: 'Volume' },
      { key: 'orders', label: 'Orders' },
      { key: 'status', label: 'Status', capitalize: true },
      { key: 'deliverDate', label: 'Delivery Date', date: true }
    ],
    range: "all",
    orderFilter: "All",
    dateMode: "delivery"
}

const CouriersSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer', link: true, width: '1fr' },
    { key: 'totalWeight', label: 'Weight' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
  ],
    range: "all",
    orderFilter: "All",
    dateMode: "delivery"
}

const HeldSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer' },
    { key: 'ordersCount', label: '# Orders' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'deliverDate', label: 'Delivery Date' },
  ],
    range: "all",
    orderFilter: "All",
    dateMode: "delivery"
}

const NotPickedSettings: WidgetSettings = {
    columns: [
        { key: 'customer', label: 'Customer', link: true, width: '1fr' },
        { key: 'totalPallets', label: 'Pallets', width: '70px' },
        { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
  ],
    range: "all",
    orderFilter: "All",
    dateMode: "pick"
}

const SalesSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer', width: '50%' },
    { key: 'orders', label: 'Orders' },
    { key: 'deliverDate', label: 'Delivery Date', date: true },
  ],
    range: "all",
    orderFilter: "All",
    dateMode: "delivery"
}

export const WIDGET_DEFAULT_SETTINGS: Record<WIDGET_NAMES, WidgetSettings> = {
    "orders": AllOrdersSettings,
    "courier": CouriersSettings,
    "held": HeldSettings,
    "not-picked": NotPickedSettings,
    "sales": SalesSettings
}