import { 
  json,
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  SubmitFunction,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import appStylesHref from "./app.css?url";
import { ContactRecord, createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref }
]

export const action = async () => {
  const contact = await createEmptyContact();
  return new Response(
    JSON.stringify({ contact }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
}

export const loader: LoaderFunction = async ({
  request
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const  contacts = await getContacts(q);
  // return json({ contacts });
  return new Response(
    JSON.stringify({ contacts, q }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching = 
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <SideBar
         contacts={contacts}
          q={q}
          submit={submit}
          searching={searching}
        />
        <div
         className={
          navigation.state === "loading" ? "loading": ""
         }
         id="detail">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

interface SideBarProps {
  contacts: ContactRecord[];
  q: string | null;
  submit: SubmitFunction;
  searching: boolean | undefined;
}

const SideBar: React.FC<SideBarProps> = ({ contacts, q, submit, searching }) => {
  return (
    <div id="sidebar">
      <h1>Remix Contacts</h1>
      <div>
        <Form
         id="search-form"
          role="search"
          onChange={(e) => {
            const isFirstSearch  = q === null;
            submit(e.currentTarget, {
              replace: !isFirstSearch
            })
          }}
        >
          <input
            id="q"
            className={searching ? "loading" : ""}
            aria-label="Search contacts"
            defaultValue={q || ""}
            placeholder="Search"
            type="search"
            name="q"
          />
          <div id="search-spinner" aria-hidden hidden={!searching} />
        </Form>
        <Form method="post">
          <button type="submit">New</button>
        </Form>
      </div>
      <nav>
        {contacts.length ? (
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <NavLink
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "active"
                      : isPending
                      ? "pending"
                      : ""
                  }
                  to={`contacts/${contact.id}`}
                >
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{" "}
                  {contact.favorite ? (
                    <span>⭐️</span>
                  ): null}
                </NavLink>
                {/* <Link to={`contacts/${contact.id}`}>
                </Link> */}
              </li>
            ))}
          </ul>
        ) :  (
          <p>
            <i>No contacts</i>
          </p>
        )}
      </nav>
    </div>
  )
}