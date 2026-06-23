import type { Client } from "@/lib/listing-types";

type ContactStripProps = {
  client: Client;
};

export function ContactStrip({ client }: ContactStripProps) {
  const telHref = `tel:${client.phone.replace(/\s/g, "")}`;

  return (
    <p className="text-sm text-slate-500">
      Questions? Contact{" "}
      <span className="font-medium text-slate-700">{client.name}</span>
      {" · "}
      <a
        href={telHref}
        className="text-emerald-700 underline-offset-2 hover:underline"
      >
        {client.phone}
      </a>
      {client.messengerUrl && (
        <>
          {" · "}
          <a
            href={client.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline-offset-2 hover:underline"
          >
            Messenger
          </a>
        </>
      )}
      {client.facebookUrl && (
        <>
          {" · "}
          <a
            href={client.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline-offset-2 hover:underline"
          >
            Facebook
          </a>
        </>
      )}
    </p>
  );
}
