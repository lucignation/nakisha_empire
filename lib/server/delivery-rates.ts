import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import { DEFAULT_DELIVERY_FEE, NIGERIAN_STATES, type DeliveryRateRecord } from "@/lib/delivery";
import { prisma } from "@/lib/prisma";

const deliveryRateSelect = {
  id: true,
  stateCode: true,
  stateName: true,
  feeAmount: true,
  updatedAt: true
} satisfies Prisma.DeliveryRateSelect;

type DeliveryRateDbRecord = Prisma.DeliveryRateGetPayload<{ select: typeof deliveryRateSelect }>;
let deliveryRatesTableAvailable: boolean | null = null;

function databaseIsConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function mergeRates(records: DeliveryRateDbRecord[]): DeliveryRateRecord[] {
  const ratesByCode = new Map(records.map((record) => [record.stateCode, record]));

  return NIGERIAN_STATES.map((state) => {
    const record = ratesByCode.get(state.code);

    return {
      stateCode: state.code,
      stateName: state.name,
      feeAmount: record?.feeAmount ?? DEFAULT_DELIVERY_FEE,
      updatedAt: record?.updatedAt?.toISOString()
    };
  });
}

export async function getDeliveryRates(): Promise<DeliveryRateRecord[]> {
  noStore();

  if (!databaseIsConfigured()) {
    return mergeRates([]);
  }

  if (deliveryRatesTableAvailable === false) {
    return mergeRates([]);
  }

  try {
    const records = await prisma.deliveryRate.findMany({
      orderBy: [{ stateName: "asc" }],
      select: deliveryRateSelect
    });

    deliveryRatesTableAvailable = true;
    return mergeRates(records);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      deliveryRatesTableAvailable = false;
      return mergeRates([]);
    }

    console.error("Unable to query delivery rates from Prisma/Neon", error);
    return mergeRates([]);
  }
}

export async function saveDeliveryRates(
  rates: Array<Pick<DeliveryRateRecord, "stateCode" | "stateName" | "feeAmount">>
) {
  if (!databaseIsConfigured()) {
    throw new Error("DATABASE_URL is missing. Connect Neon before saving delivery rates.");
  }

  const sanitizedRates = NIGERIAN_STATES.map((state) => {
    const incoming = rates.find((rate) => rate.stateCode === state.code);

    return {
      stateCode: state.code,
      stateName: state.name,
      feeAmount: Math.max(0, incoming?.feeAmount ?? DEFAULT_DELIVERY_FEE)
    };
  });

  try {
    await prisma.$transaction(async (tx) => {
      for (const rate of sanitizedRates) {
        await tx.deliveryRate.upsert({
          where: {
            stateCode: rate.stateCode
          },
          create: rate,
          update: {
            stateName: rate.stateName,
            feeAmount: rate.feeAmount
          }
        });
      }
    });
  } catch (error) {
    console.error("Unable to save delivery rates to Prisma/Neon", error);
    throw new Error("Delivery rate storage is not ready yet. Run the latest Prisma schema on the database first.");
  }

  return getDeliveryRates();
}
