"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  type?: "idiyappam" | "combo" | "party" | "other";
};

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

const WHATSAPP_NUMBERS = [
  "27651188768",
  "27607104011",
];

const MENU: MenuItem[] = [
  {
    id: "rice",
    name: "Rice Idiyappam",
    price: 30,
    type: "idiyappam",
    description: "Fresh homemade rice idiyappam",
  },
  {
    id: "ragi",
    name: "Ragi Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Healthy homemade ragi idiyappam",
  },
  {
    id: "wheat",
    name: "Wheat Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Fresh homemade wheat idiyappam",
  },
  {
    id: "sweet-rice",
    name: "Sweet Rice Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet rice idiyappam",
  },
  {
    id: "sweet-ragi",
    name: "Sweet Ragi Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet ragi idiyappam",
  },

  {
    id: "egg-kothu",
    name: "Egg Idiyappam Kothu",
    price: 80,
    description: "Egg idiyappam kothu",
  },
  {
    id: "chicken-kothu",
    name: "Chicken Idiyappam Kothu",
    price: 100,
    description: "Chicken idiyappam kothu",
  },

  {
    id: "lamb-kurma",
    name: "Lamb Kurma / Gravy",
    price: 140,
    description: "Homemade lamb kurma / gravy",
  },
  {
    id: "chicken-kurma",
    name: "Chicken Kurma / Gravy",
    price: 100,
    description: "Homemade chicken kurma / gravy",
  },
  {
    id: "egg-kurma",
    name: "Egg Kurma",
    price: 90,
    description: "Homemade egg kurma",
  },
  {
    id: "veg-kurma",
    name: "Veg White Kurma",
    price: 80,
    description: "Creamy vegetarian white kurma",
  },
  {
    id: "paya",
    name: "Attukal Paya",
    price: 125,
    description: "Traditional homemade attukal paya",
  },

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
    description: "2 plates Idiyappam + Veg White Kurma",
  },

  {
    id: "coconut-milk",
    name: "Coconut Milk",
    price: 50,
    description: "Fresh coconut milk",
  },

  {
    id: "lamb-biryani",
    name: "Chennai Style Lamb Dum Biryani with Egg",
    price: 140,
    type: "party",
  },
  {
    id: "chicken-biryani",
    name: "Chennai Style Chicken Dum Biryani with Egg",
    price: 110,
    type: "party",
  },
];

function getJohannesburgNow() {
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

  const get = (name: string) =>
    parts.find((p) => p.type === name)?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
  };
}

function formatDateInput(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function getMinimumCollectionDate() {
  const now = getJohannesburgNow();

  const date = new Date(
    now.year,
    now.month - 1,
    now.day
  );

  if (now.hour >= 12) {
    date.setDate(date.getDate() + 1);
  }

  return formatDateInput(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

function displayDate(value: string) {
  if (!value) return "";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

export default function Home() {
  const [quantities, setQuantities] =
    useState<Record<string, number>>({});

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [collectionDate, setCollectionDate] =
    useState(getMinimumCollectionDate());

  const [collectionMethod, setCollectionMethod] =
    useState<
      "Home collection" | "Uber pickup"
    >("Home collection");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const cart = useMemo(() => {
    return MENU
      .filter(
        (item) =>
          (quantities[item.id] || 0) > 0
      )
      .map((item) => ({
        ...item,
        quantity: quantities[item.id],
      }));
  }, [quantities]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );
  }, [cart]);

  const totalSelectedItems = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [cart]);

  const idiyappamPlates = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.type === "idiyappam") {
        return sum + item.quantity;
      }

      if (item.type === "combo") {
        return sum + item.quantity * 2;
      }

      return sum;
    }, 0);
  }, [cart]);

  const partyBiryaniPlates = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.type === "party") {
        return sum + item.quantity;
      }

      return sum;
    }, 0);
  }, [cart]);

  const hasRegularItems = cart.some(
    (item) => item.type !== "party"
  );

  const hasPartyItems = cart.some(
    (item) => item.type === "party"
  );

  function increase(id: string) {
    setQuantities((old) => ({
      ...old,
      [id]: (old[id] || 0) + 1,
    }));
  }

  function decrease(id: string) {
    setQuantities((old) => {
      const current = old[id] || 0;

      if (current <= 1) {
        const next = { ...old };
        delete next[id];
        return next;
      }

      return {
        ...old,
        [id]: current - 1,
      };
    });
  }

  function changePhone(value: string) {
    setCustomerPhone(
      value.replace(/\D/g, "").slice(0, 10)
    );
  }

  function validate() {
    if (!customerName.trim()) {
      return "Please enter your name.";
    }

    if (!/^\d{10}$/.test(customerPhone)) {
      return "Please enter a valid 10-digit South African phone number.";
    }

    if (!collectionDate) {
      return "Please select a collection date.";
    }

    if (
      collectionDate <
      getMinimumCollectionDate()
    ) {
      return "The selected collection date is no longer available.";
    }

    if (cart.length === 0) {
      return "Please select at least one menu item.";
    }

    if (
      hasRegularItems &&
      idiyappamPlates < 5
    ) {
      return "The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.";
    }

    if (
      hasPartyItems &&
      partyBiryaniPlates < 5
    ) {
      return "The minimum party order is 5 biryani plates.";
    }

    return "";
  }

  function makeOrderNumber() {
    return String(
      Math.floor(
        1000 + Math.random() * 9000
      )
    );
  }

  function makeWhatsAppMessage(
    orderNumber: string
  ) {
    let message =
      "*ANNAI FOODS - NEW ORDER*\n\n";

    message +=
      `*Order Number:* ${orderNumber}\n\n`;

    message +=
      "*Customer Details*\n";

    message +=
      `Name: ${customerName.trim()}\n`;

    message +=
      `Phone: ${customerPhone}\n\n`;

    message +=
      "*Collection Details*\n";

    message +=
      `Collection Date: ${displayDate(
        collectionDate
      )}\n`;

    message +=
      `Collection Method: ${collectionMethod}\n`;

    message +=
      `Address: ${COLLECTION_ADDRESS}\n\n`;

    message += "*Order Items*\n";

    cart.forEach((item) => {
      message +=
        `${item.name} x ${item.quantity} - R${
          item.price * item.quantity
        }\n`;
    });

    message += "\n*Order Summary*\n";

    message +=
      `Total Selected Items: ${totalSelectedItems}\n`;

    message +=
      `Total Idiyappam Plates: ${idiyappamPlates}\n`;

    if (partyBiryaniPlates > 0) {
      message +=
        `Party Biryani Plates: ${partyBiryaniPlates}\n`;
    }

    message +=
      `*GRAND TOTAL: R${total}*\n\n`;

    message +=
      "Thank you for choosing ANNAI FOODS! ❤️";

    return encodeURIComponent(message);
  }

  async function submitOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      let orderNumber =
        makeOrderNumber();

      for (let i = 0; i < 10; i++) {
        const { data } =
          await supabase
            .from("orders")
            .select("id")
            .eq(
              "order_number",
              orderNumber
            )
            .maybeSingle();

        if (!data) break;

        orderNumber =
          makeOrderNumber();
      }

      const items = cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total:
          item.price * item.quantity,
        type: item.type || "other",
      }));

      const { error: dbError } =
        await supabase
          .from("orders")
          .insert({
            order_number:
              orderNumber,
            customer_name:
              customerName.trim(),
            customer_phone:
              customerPhone,
            items,
            total,
            idiyappam_plates:
              idiyappamPlates,
            collection_date:
              collectionDate,
            collection_method:
              collectionMethod,
          });

      if (dbError) {
        console.error(dbError);
        throw new Error(
          "Your order could not be saved. Please try again."
        );
      }

      const message =
        makeWhatsAppMessage(
          orderNumber
        );

      const links =
        WHATSAPP_NUMBERS.map(
          (number) =>
            `https://wa.me/${number}?text=${message}`
        );

      setSuccess(
        `Order #${orderNumber} has been submitted successfully.`
      );

      window.open(
        links[0],
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.open(
          links[1],
          "_blank",
          "noopener,noreferrer"
        );
      }, 800);

      setCustomerName("");
      setCustomerPhone("");
      setQuantities({});
      setCollectionMethod(
        "Home collection"
      );
      setCollectionDate(
        getMinimumCollectionDate()
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your order."
      );
    } finally {
      setLoading(false);
    }
  }

  function MenuSection({
    title,
    items,
    note,
  }: {
    title: string;
    items: MenuItem[];
    note?: string;
  }) {
    return (
      <section className="mb-7 rounded-[24px] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <h2 className="mb-6 text-[28px] font-extrabold uppercase leading-tight text-[#9a4514]">
          {title}
        </h2>

        {note && (
          <p className="mb-6 text-[18px] leading-7 text-gray-600">
            {note}
          </p>
        )}

        {items.map((item, index) => {
          const quantity =
            quantities[item.id] || 0;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 py-6 ${
                index !== items.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-[21px] font-bold leading-7 text-gray-900">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="mt-2 text-[18px] leading-6 text-gray-600">
                    {item.description}
                  </p>
                )}

                <p className="mt-3 text-[21px] font-extrabold text-[#9a4514]">
                  R{item.price}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <button
                  type="button"
                  onClick={() =>
                    decrease(item.id)
                  }
                  className="flex h-[74px] w-[66px] items-center justify-center rounded-[14px] bg-[#9a4514] text-[32px] font-bold text-white"
                >
                  −
                </button>

                <span className="w-[22px] text-center text-[22px] font-semibold text-gray-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    increase(item.id)
                  }
                  className="flex h-[74px] w-[66px] items-center justify-center rounded-[14px] bg-[#9a4514] text-[32px] font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  const idiyappamItems =
    MENU.filter(
      (item) =>
        item.type === "idiyappam"
    );

  const kothuItems =
    MENU.filter((item) =>
      item.name.includes("Kothu")
    );

  const gravyItems =
    MENU.filter((item) =>
      [
        "Lamb Kurma / Gravy",
        "Chicken Kurma / Gravy",
        "Egg Kurma",
        "Veg White Kurma",
        "Attukal Paya",
      ].includes(item.name)
    );

  const comboItems =
    MENU.filter(
      (item) =>
        item.type === "combo"
    );

  const sideItems =
    MENU.filter(
      (item) =>
        item.id === "coconut-milk"
    );

  const partyItems =
    MENU.filter(
      (item) =>
        item.type === "party"
    );

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-6">
      <div className="mx-auto w-full max-w-[720px]">

        {/* HEADER */}

        <div className="mb-7 rounded-[24px] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <h1 className="text-[34px] font-extrabold text-gray-900">
            ANNAI FOODS
          </h1>

          <p className="mt-4 text-[19px] text-gray-500">
            Fresh Homemade Idiyappam ❤️
          </p>

          <p className="mt-3 text-[18px] text-gray-500">
            Soft • Fresh • Healthy • Delicious
          </p>

          <p className="mt-4 text-[18px] text-gray-500">
            Fresh Homemade Idiyappam – Made with Love ❤️
          </p>
        </div>

        <form onSubmit={submitOrder}>

          <MenuSection
            title="IDYAPPAM"
            items={idiyappamItems}
          />

          <MenuSection
            title="KOTHU"
            items={kothuItems}
          />

          <MenuSection
            title="GRAVY & KURMA"
            items={gravyItems}
          />

          <MenuSection
            title="COMBOS"
            items={comboItems}
          />

          <MenuSection
            title="SIDES"
            items={sideItems}
          />

          <MenuSection
            title="PARTY MENU – CHENNAI STYLE DUM BIRYANI"
            items={partyItems}
            note="Minimum 5 plates. You can mix Lamb and Chicken Biryani."
          />

          {/* ORDER SUMMARY */}

          <section className="mb-7 rounded-[24px] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h2 className="mb-6 text-[28px] font-extrabold text-[#9a4514]">
              ORDER SUMMARY
            </h2>

            {cart.length === 0 ? (
              <p className="text-[18px] text-gray-500">
                No items selected.
              </p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b border-gray-200 py-3 text-[17px]"
                  >
                    <span>
                      {item.name} ×{" "}
                      {item.quantity}
                    </span>

                    <strong>
                      R
                      {item.price *
                        item.quantity}
                    </strong>
                  </div>
                ))}

                <div className="mt-5 space-y-3 text-[18px]">
                  <div className="flex justify-between">
                    <span>
                      Total Selected Items
                    </span>
                    <strong>
                      {totalSelectedItems}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Total Idiyappam Plates
                    </span>
                    <strong>
                      {idiyappamPlates}
                    </strong>
                  </div>

                  {partyBiryaniPlates >
                    0 && (
                    <div className="flex justify-between">
                      <span>
                        Party Biryani Plates
                      </span>
                      <strong>
                        {partyBiryaniPlates}
                      </strong>
                    </div>
                  )}

                  <div className="mt-5 flex justify-between border-t border-gray-200 pt-5 text-[23px] font-extrabold">
                    <span>
                      GRAND TOTAL
                    </span>

                    <span className="text-[#9a4514]">
                      R{total}
                    </span>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* COLLECTION */}

          <section className="mb-7 rounded-[24px] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h2 className="mb-6 text-[28px] font-extrabold text-[#9a4514]">
              COLLECTION DETAILS
            </h2>

            <label className="mb-3 block text-[19px] font-bold">
              Collection Date
            </label>

            <input
              type="date"
              min={getMinimumCollectionDate()}
              value={collectionDate}
              onChange={(e) =>
                setCollectionDate(
                  e.target.value
                )
              }
              className="mb-7 w-full rounded-[14px] border border-gray-300 px-5 py-4 text-[18px]"
            />

            <h3 className="mb-5 text-[20px] font-bold">
              Collection Method
            </h3>

            <div className="space-y-6">

              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="radio"
                  name="collectionMethod"
                  checked={
                    collectionMethod ===
                    "Home collection"
                  }
                  onChange={() =>
                    setCollectionMethod(
                      "Home collection"
                    )
                  }
                  className="mt-1 h-7 w-7"
                />

                <div>
                  <p className="text-[20px] font-bold">
                    Home collection
                  </p>

                  <p className="mt-2 text-[18px] leading-7 text-gray-600">
                    {COLLECTION_ADDRESS}
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="radio"
                  name="collectionMethod"
                  checked={
                    collectionMethod ===
                    "Uber pickup"
                  }
                  onChange={() =>
                    setCollectionMethod(
                      "Uber pickup"
                    )
                  }
                  className="mt-1 h-7 w-7"
                />

                <div>
                  <p className="text-[20px] font-bold">
                    Uber pickup
                  </p>

                  <p className="mt-2 text-[18px] leading-7 text-gray-600">
                    For Uber pickup, the customer must arrange the Uber driver to collect from the address above. Uber charges are the customer's responsibility.
                  </p>
                </div>
              </label>

            </div>
          </section>

          {/* CUSTOMER DETAILS */}

          <section className="mb-7 rounded-[24px] bg-white px-8 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h2 className="mb-7 text-[28px] font-extrabold text-[#9a4514]">
              CUSTOMER DETAILS
            </h2>

            <label className="mb-3 block text-[19px] font-bold">
              Full Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              placeholder="Enter your full name"
              className="mb-7 w-full rounded-[14px] border border-gray-300 px-5 py-4 text-[20px]"
            />

            <label className="mb-3 block text-[19px] font-bold">
              WhatsApp / Contact Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={customerPhone}
              onChange={(e) =>
                changePhone(
                  e.target.value
                )
              }
              placeholder="10-digit number"
              className="w-full rounded-[14px] border border-gray-300 px-5 py-4 text-[20px]"
            />
          </section>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-[18px] bg-[#fde8e8] px-6 py-5 text-[20px] leading-7 text-[#922b2b]">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 rounded-[18px] bg-green-100 px-6 py-5 text-[18px] font-semibold text-green-800">
              {success}
            </div>
          )}

          {/* MINIMUM ORDER */}

          {!error && (
            <div className="mb-6 rounded-[18px] bg-[#fde8e8] px-6 py-5 text-[20px] leading-7 text-[#922b2b]">
              The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="mb-10 w-full rounded-[15px] bg-[#9a4514] px-6 py-5 text-[23px] font-extrabold text-white disabled:opacity-60"
          >
            {loading
              ? "Submitting Order..."
              : "Submit Order"}
          </button>

        </form>
      </div>
    </main>
  );
}
