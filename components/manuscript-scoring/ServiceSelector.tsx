"use client";

import { SERVICES } from "@/lib/manuscript-scoring/services";

import { ServiceType } from "@/types/services";

type Props = {
  activeService: ServiceType;

  onChange: (
    service: ServiceType
  ) => void;
};

export default function ServiceSelector({
  activeService,
  onChange,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      {SERVICES.map((service) => (
        <button
          key={service.id}
          onClick={() =>
            onChange(service.id)
          }
          className={`
            rounded-2xl border p-5 text-left transition
            ${
              activeService === service.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300"
            }
          `}
        >
          <h3 className="font-semibold">
            {service.title}
          </h3>

          <p
            className={`
              mt-2 text-sm leading-relaxed
              ${
                activeService ===
                service.id
                  ? "text-slate-300"
                  : "text-slate-500"
              }
            `}
          >
            {service.description}
          </p>
        </button>
      ))}
    </div>
  );
}

