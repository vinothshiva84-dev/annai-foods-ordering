"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

// ======================================================
// SUPABASE
// ======================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

// ======================================================
// TYPES
// ======================================================

type MenuItem = {
  id: string;
  name: string;
  price: number;
  type?: "idiyappam" | "combo" | "party" | "other";
  description?: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

// ======================================================
// MENU
// ======================================================

const MENU: MenuItem[] = [
  // ====================================================
  // REGULAR IDIYAPPAM
  // ====================================================

  {
    id: "rice-idiyappam",
    name: "Rice Idiyappam",
    price: 30,
    type: "idiyappam",
    description: "Fresh homemade rice idiyappam",
  },

  {
    id: "ragi-idiyappam",
    name: "Ragi Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Healthy homemade ragi idiyappam",
  },

  {
    id: "wheat-idiyappam",
    name: "Wheat Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Fresh homemade wheat idiyappam",
  },

  {
    id: "sweet-rice-idiyappam",
    name: "Sweet Rice Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet rice idiyappam",
  },

  {
    id: "sweet-ragi-idiyappam",
    name: "Sweet Ragi Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet ragi idiyappam",
  },

  // ====================================================
  // KOTHU
  // ====================================================

  {
    id: "egg-idiyappam-kothu",
    name: "Egg Idiyappam Kothu",
    price: 80,
    type: "other",
    description: "Egg idiyappam kothu",
  },

  {
    id: "chicken-idiyappam-kothu",
    name: "Chicken Idiyappam Kothu",
    price: 100,
    type: "other",
    description: "Chicken idiyappam kothu",
  },

  // ====================================================
  // GRAVY & KURMA
  // ====================================================

  {
    id: "lamb-kurma",
    name: "Lamb Kurma / Gravy",
    price: 140,
    type: "other",
    description: "Rich homemade lamb kurma / gravy",
  },

  {
    id: "chicken-kurma",
    name: "Chicken Kurma / Gravy",
    price: 100,
    type: "other",
    description: "Homemade chicken kurma / gravy",
  },

  {
    id: "egg-kurma",
    name: "Egg Kurma",
    price: 90,
    type: "other",
    description: "Homemade egg kurma",
  },

  {
    id: "veg-white-kurma",
    name: "Veg White Kurma",
    price: 80,
    type: "other",
    description: "Creamy vegetarian white kurma",
  },

  {
    id: "attukal-paya",
    name: "Attukal Paya",
    price: 125,
    type: "other",
    description: "Traditional homemade attukal paya",
  },

  // ====================================================
  // COMBOS
  // ====================================================

  {
    id: "combo-1",
    name: "Combo 1",
    price: 140,
    type: "combo",
    description: "2 plates Idiyappam + 1 portion Chicken Gravy",
  },

  {
    id: "combo-2",
    name: "Combo 2",
    price: 125,
    type: "combo",
    description: "2 plates Idiyappam + Veg White Kurma + Coconut Milk",
  },

  // ====================================================
  // SIDES
  // ====================================================

  {
    id: "coconut-milk",
    name: "Coconut Milk",
    price: 50,
    type: "other",
    description: "Fresh coconut milk",
  },

  // ====================================================
  // PARTY MENU
  // ====================================================

  {
    id: "lamb-biryani",
    name: "Chennai Style Lamb Dum Biryani with Egg",
    price: 140,
    type: "party",
    description: "Chennai-style lamb dum biryani with egg",
  },

  {
    id: "chicken-biryani",
    name: "Chennai Style Chicken Dum Biryani with Egg",
    price: 110,
    type: "party",
    description: "Chennai-style chicken dum biryani with egg",
  },
];

// ======================================================
// CONSTANTS
// ======================================================

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

const WHATSAPP_NUMBERS = [
  "27651188768",
  "27607104011",
];

// ======================================================
// JOHANNESBURG DATE HELPERS
// ======================================================

function getJohannesburgDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinimumCollectionDate() {
  const now = getJohannesburgDateParts();

  const today = new Date(
    now.year,
    now.month - 1,
    now.day
  );

  // Before 12 PM Johannesburg time:
  // today is available.

  if (now.hour < 12) {
    return formatDateForInput(today);
  }

  // At or after 12 PM:
  // today is closed and tomorrow is the earliest date.

  today.setDate(today.getDate() + 1);

  return formatDateForInput(today);
}

function formatDisplayDate(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function Home() {
  const [quantities, setQuantities] = useState<
    Record<string, number>
  >({});

  const [customerName, setCustomerName] = useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [collectionDate, setCollectionDate] =
    useState(getMinimumCollectionDate());

  const [collectionMethod, setCollectionMethod] =
    useState<
      "Home collection" | "Uber pickup"
    >("Home collection");

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ====================================================
  // CART
  // ====================================================

  const cartItems: CartItem[] = useMemo(() => {
    return MENU.filter(
      (item) => (quantities[item.id] || 0) > 0
    ).map((item) => ({
      ...item,
      quantity: quantities[item.id],
    }));
  }, [quantities]);

  // ====================================================
  // TOTAL AMOUNT
  // ====================================================

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // ====================================================
  // TOTAL SELECTED ITEMS
  // ====================================================

  const totalSelectedItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  // ====================================================
  // TOTAL IDIYAPPAM PLATES
  // ====================================================

  const totalIdiyappamPlates = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (item.type === "idiyappam") {
        return total + item.quantity;
      }

      if (item.type === "combo") {
        return total + item.quantity * 2;
      }

      return total;
    }, 0);
  }, [cartItems]);

  // ====================================================
  // TOTAL PARTY BIRYANI PLATES
  // ====================================================

  const totalPartyBiryaniPlates = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (item.type === "party") {
        return total + item.quantity;
      }

      return total;
    }, 0);
  }, [cartItems]);

  // ====================================================
  // REGULAR / PARTY CHECK
  // ====================================================

  const hasRegularItems = useMemo(() => {
    return cartItems.some(
      (item) => item.type !== "party"
    );
  }, [cartItems]);

  const hasPartyItems = useMemo(() => {
    return cartItems.some(
      (item) => item.type === "party"
    );
  }, [cartItems]);

  // ====================================================
  // QUANTITY HANDLERS
  // ====================================================

  function increaseQuantity(itemId: string) {
    setQuantities((previous) => ({
      ...previous,
      [itemId]: (previous[itemId] || 0) + 1,
    }));
  }

  function decreaseQuantity(itemId: string) {
    setQuantities((previous) => {
      const current = previous[itemId] || 0;

      if (current <= 1) {
        const updated = {
          ...previous,
        };

        delete updated[itemId];

        return updated;
      }

      return {
        ...previous,
        [itemId]: current - 1,
      };
    });
  }

  // ====================================================
  // PHONE HANDLER
  // ====================================================

  function handlePhoneChange(value: string) {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 10);

    setCustomerPhone(digitsOnly);
  }

  // ====================================================
  // VALIDATION
  // ====================================================

  function validateOrder() {
    if (!customerName.trim()) {
      return "Please enter your name.";
    }

    if (!/^\d{10}$/.test(customerPhone)) {
      return "Please enter a valid 10-digit South African phone number.";
    }

    if (!collectionDate) {
      return "Please select a collection date.";
    }

    const minimumDate =
      getMinimumCollectionDate();

    if (collectionDate < minimumDate) {
      return "The selected collection date is no longer available. Please select another date.";
    }

    if (cartItems.length === 0) {
      return "Please select at least one menu item.";
    }

    // Regular menu minimum
    if (
      hasRegularItems &&
      totalIdiyappamPlates < 5
    ) {
      return `The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.`;
    }

    // Party menu minimum
    if (
      hasPartyItems &&
      totalPartyBiryaniPlates < 5
    ) {
      return "The minimum party order is 5 biryani plates.";
    }

    return null;
  }

  // ====================================================
  // ORDER NUMBER
  // ====================================================

  function generateOrderNumber() {
    return String(
      Math.floor(
        1000 + Math.random() * 9000
      )
    );
  }

  // ====================================================
  // WHATSAPP MESSAGE
  // ====================================================

  function createWhatsAppMessage(
    orderNumber: string
  ) {
    let message = "";

    message +=
      `*ANNAI FOODS - NEW ORDER*%0A`;

    message += `%0A`;

    message +=
      `*Order Number:* ${orderNumber}%0A`;

    message += `%0A`;

    message +=
      `*Customer Details*%0A`;

    message +=
      `Name: ${customerName.trim()}%0A`;

    message +=
      `Phone: ${customerPhone}%0A`;

    message += `%0A`;

    message +=
      `*Collection Details*%0A`;

    message +=
      `Collection Date: ${formatDisplayDate(
        collectionDate
      )}%0A`;

    message +=
      `Collection Method: ${collectionMethod}%0A`;

    if (
      collectionMethod === "Home collection"
    ) {
      message +=
        `Address: ${COLLECTION_ADDRESS}%0A`;
    }

    message += `%0A`;

    message += `*Order Items*%0A`;

    cartItems.forEach((item) => {
      const itemTotal =
        item.price * item.quantity;

      message +=
        `${item.name} x ${item.quantity} - R${itemTotal}%0A`;
    });

    message += `%0A`;

    message += `*Order Summary*%0A`;

    message +=
      `Total Selected Items: ${totalSelectedItems}%0A`;

    message +=
      `Total Idiyappam Plates: ${totalIdiyappamPlates}%0A`;

    if (totalPartyBiryaniPlates > 0) {
      message +=
        `Total Party Biryani Plates: ${totalPartyBiryaniPlates}%0A`;
    }

    message +=
      `*GRAND TOTAL: R${totalAmount}*%0A`;

    message += `%0A`;

    message +=
      `Thank you for choosing ANNAI FOODS! ❤️`;

    return message;
  }

  // ====================================================
  // SUBMIT ORDER
  // ====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError =
      validateOrder();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      let orderNumber =
        generateOrderNumber();

      // Check that order number is unique.
      for (
        let attempt = 0;
        attempt < 10;
        attempt++
      ) {
        const {
          data: existingOrder,
        } = await supabase
          .from("orders")
          .select("id")
          .eq(
            "order_number",
            orderNumber
          )
          .maybeSingle();

        if (!existingOrder) {
          break;
        }

        orderNumber =
          generateOrderNumber();
      }

      // ==================================================
      // ORDER ITEMS
      // ==================================================

      const orderItems =
        cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total:
            item.price * item.quantity,
          type:
            item.type || "other",
        }));

      // ==================================================
      // SAVE TO SUPABASE
      // ==================================================

      const {
        error: insertError,
      } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name:
            customerName.trim(),
          customer_phone:
            customerPhone,
          items: orderItems,
          total: totalAmount,
          idiyappam_plates:
            totalIdiyappamPlates,
          collection_date:
            collectionDate,
          collection_method:
            collectionMethod,
        });

      if (insertError) {
        console.error(
          "Supabase order error:",
          insertError
        );

        throw new Error(
          "Your order could not be saved. Please try again."
        );
      }

      // ==================================================
      // WHATSAPP
      // ==================================================

      const whatsappMessage =
        createWhatsAppMessage(
          orderNumber
        );

      setSuccessMessage(
        `Order #${orderNumber} has been submitted successfully.`
      );

      const whatsappUrls =
        WHATSAPP_NUMBERS.map(
          (number) =>
            `https://wa.me/${number}?text=${whatsappMessage}`
        );

      // Open first WhatsApp notification
      window.open(
        whatsappUrls[0],
        "_blank",
        "noopener,noreferrer"
      );

      // Open second WhatsApp notification
      setTimeout(() => {
        window.open(
          whatsappUrls[1],
          "_blank",
          "noopener,noreferrer"
        );
      }, 800);

      // ==================================================
      // RESET FORM
      // ==================================================

      setCustomerName("");
      setCustomerPhone("");
      setQuantities({});
      setCollectionMethod(
        "Home collection"
      );
      setCollectionDate(
        getMinimumCollectionDate()
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your order."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // MENU ITEM COMPONENT
  // ======================================================

  function renderMenuItem(
    item: MenuItem
  ) {
    const quantity =
      quantities[item.id] || 0;

    return (
      <div
        key={item.id}
        className="border-b border-gray-200 py-5 last:border-b-0"
      >
        <div className="flex items-center justify-between gap-4">

          {/* ITEM DETAILS */}

          <div className="min-w-0 flex-1">

            <h3 className="text-lg font-bold text-gray-900">
              {item.name}
            </h3>

            {item.description && (
              <p className="mt-1 text-base leading-6 text-gray-500">
                {item.description}
              </p>
            )}

            <p className="mt-2 text-lg font-bold text-[#963f0d]">
              R{item.price}
            </p>

          </div>

          {/* QUANTITY */}

          <div className="flex shrink-0 items-center gap-4">

            <button
              type="button"
              onClick={() =>
                decreaseQuantity(
                  item.id
                )
              }
              disabled={quantity === 0}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#963f0d] text-3xl font-bold text-white disabled:opacity-40"
            >
              −
            </button>

            <span className="w-7 text-center text-xl font-bold text-gray-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                increaseQuantity(
                  item.id
                )
              }
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#963f0d] text-3xl font-bold text-white"
            >
              +
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-[#fff8ef] px-4 py-6">

      <div className="mx-auto max-w-3xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 rounded-3xl bg-white px-6 py-7 text-center shadow-sm">

          <h1 className="text-4xl font-extrabold tracking-wide text-[#963f0d]">
            ANNAI FOODS
          </h1>

          <p className="mt-2 text-xl font-bold text-gray-900">
            Fresh Homemade Idiyappam ❤️
          </p>

          <p className="mt-1 text-base text-gray-600">
            Soft • Fresh • Healthy • Delicious
          </p>

          <p className="mt-3 text-sm text-gray-600">
            Fresh Homemade Idiyappam – Made with Love ❤️
          </p>

        </div>

        {/* ==================================================
            ORDER FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              REGULAR IDIYAPPAM
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              REGULAR IDIYAPPAM
            </h2>

            <div>
              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "idiyappam"
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              KOTHU
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              KOTHU
            </h2>

            <div>
              {MENU
                .filter(
                  (item) =>
                    item.name.includes(
                      "Kothu"
                    )
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              GRAVY & KURMA
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              GRAVY & KURMA
            </h2>

            <div>
              {MENU
                .filter(
                  (item) =>
                    [
                      "Lamb Kurma / Gravy",
                      "Chicken Kurma / Gravy",
                      "Egg Kurma",
                      "Veg White Kurma",
                      "Attukal Paya",
                    ].includes(
                      item.name
                    )
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              COMBOS
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              COMBOS
            </h2>

            <div>
              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "combo"
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              SIDES
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              SIDES
            </h2>

            <div>
              {MENU
                .filter(
                  (item) =>
                    item.id ===
                    "coconut-milk"
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              PARTY MENU
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-4 text-3xl font-extrabold leading-tight text-[#963f0d]">
              PARTY MENU – CHENNAI STYLE
              <br />
              DUM BIRYANI
            </h2>

            <p className="mb-4 text-base leading-6 text-gray-600">
              Minimum 5 plates. You can mix
              Lamb and Chicken Biryani.
            </p>

            <div>
              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "party"
                )
                .map(renderMenuItem)}
            </div>

          </section>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              ORDER SUMMARY
            </h2>

            {cartItems.length === 0 ? (

              <p className="text-base text-gray-500">
                No items selected yet.
              </p>

            ) : (

              <div className="space-y-4">

                {cartItems.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 border-b border-gray-200 pb-3"
                    >

                      <div>

                        <p className="font-bold text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.quantity} × R
                          {item.price}
                        </p>

                      </div>

                      <p className="font-bold text-gray-900">
                        R
                        {item.quantity *
                          item.price}
                      </p>

                    </div>
                  )
                )}

                <div className="space-y-2 pt-2 text-base">

                  <div className="flex justify-between">
                    <span>
                      Total Selected Items
                    </span>

                    <span className="font-bold">
                      {totalSelectedItems}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Total Idiyappam Plates
                    </span>

                    <span className="font-bold">
                      {totalIdiyappamPlates}
                    </span>
                  </div>

                  {totalPartyBiryaniPlates >
                    0 && (
                    <div className="flex justify-between">
                      <span>
                        Party Biryani Plates
                      </span>

                      <span className="font-bold">
                        {
                          totalPartyBiryaniPlates
                        }
                      </span>
                    </div>
                  )}

                </div>

                <div className="mt-5 flex justify-between border-t-2 border-[#963f0d] pt-4">

                  <span className="text-xl font-extrabold">
                    GRAND TOTAL
                  </span>

                  <span className="text-xl font-extrabold text-[#963f0d]">
                    R{totalAmount}
                  </span>

                </div>

              </div>
            )}

          </section>

          {/* ==================================================
              COLLECTION DETAILS
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-5 text-3xl font-extrabold text-[#963f0d]">
              COLLECTION DETAILS
            </h2>

            {/* COLLECTION DATE */}

            <div className="mb-7">

              <label className="mb-2 block text-lg font-bold text-gray-900">
                Collection Date
              </label>

              <input
                type="date"
                min={getMinimumCollectionDate()}
                value={collectionDate}
                onChange={(event) =>
                  setCollectionDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-lg outline-none focus:border-[#963f0d]"
              />

              <p className="mt-2 text-sm text-gray-500">
                Same-day collection is available
                only before 12:00 PM Johannesburg
                time.
              </p>

            </div>

            {/* COLLECTION METHOD */}

            <div>

              <h3 className="mb-5 text-xl font-bold text-gray-900">
                Collection Method
              </h3>

              <div className="space-y-6">

                {/* HOME COLLECTION */}

                <label className="flex cursor-pointer items-start gap-4">

                  <input
                    type="radio"
                    name="collectionMethod"
                    value="Home collection"
                    checked={
                      collectionMethod ===
                      "Home collection"
                    }
                    onChange={() =>
                      setCollectionMethod(
                        "Home collection"
                      )
                    }
                    className="mt-1 h-7 w-7 accent-[#963f0d]"
                  />

                  <span>

                    <span className="block text-xl font-bold text-gray-900">
                      Home collection
                    </span>

                    <span className="mt-1 block text-sm leading-5 text-gray-500">
                      {COLLECTION_ADDRESS}
                    </span>

                  </span>

                </label>

                {/* UBER PICKUP */}

                <label className="flex cursor-pointer items-start gap-4">

                  <input
                    type="radio"
                    name="collectionMethod"
                    value="Uber pickup"
                    checked={
                      collectionMethod ===
                      "Uber pickup"
                    }
                    onChange={() =>
                      setCollectionMethod(
                        "Uber pickup"
                      )
                    }
                    className="mt-1 h-7 w-7 accent-[#963f0d]"
                  />

                  <span>

                    <span className="block text-xl font-bold text-gray-900">
                      Uber pickup
                    </span>

                    <span className="mt-3 block text-base leading-6 text-gray-600">
                      For Uber pickup, the customer
                      must arrange the Uber driver
                      to collect from the address above.
                      Uber charges are the customer's
                      responsibility.
                    </span>

                  </span>

                </label>

              </div>

            </div>

          </section>

          {/* ==================================================
              CUSTOMER DETAILS
          ================================================== */}

          <section className="rounded-3xl bg-white px-6 py-7 shadow-sm">

            <h2 className="mb-6 text-3xl font-extrabold text-[#963f0d]">
              CUSTOMER DETAILS
            </h2>

            {/* FULL NAME */}

            <div className="mb-6">

              <label className="mb-2 block text-lg font-bold text-gray-900">
                Full Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                placeholder=""
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-4 text-lg outline-none focus:border-[#963f0d]"
              />

            </div>

            {/* PHONE */}

            <div className="mb-6">

              <label className="mb-2 block text-lg font-bold text-gray-900">
                WhatsApp / Contact Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                value={customerPhone}
                onChange={(event) =>
                  handlePhoneChange(
                    event.target.value
                  )
                }
                maxLength={10}
                placeholder=""
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-4 text-lg outline-none focus:border-[#963f0d]"
              />

            </div>

            {/* MINIMUM ORDER NOTICE */}

            <div className="rounded-2xl bg-[#fff0f0] px-5 py-5">

              <p className="text-lg leading-7 text-[#8b2f2f]">

                The minimum regular order is
                5 plates of Idiyappam.
                Combos count as 2 plates
                each.

              </p>

            </div>

          </section>

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-base font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {successMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-base font-semibold text-green-700">

              {successMessage}

              <p className="mt-2 font-normal">
                WhatsApp has been opened for
                Annai Foods order notification.
              </p>

            </div>
          )}

          {/* ==================================================
              SUBMIT ORDER
          ================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#963f0d] px-6 py-5 text-xl font-extrabold text-white shadow-md transition hover:bg-[#7f340b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "SUBMITTING ORDER..."
              : "Submit Order"}
          </button>

        </form>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="pb-8 pt-8 text-center">

          <p className="text-sm font-bold text-[#963f0d]">
            ANNAI FOODS ❤️
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Fresh Homemade Idiyappam –
            Made with Love
          </p>

        </div>

      </div>

    </main>
  );
}
