import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import answer from "./a-region-containing-point-server.js";

export default async function({ user, weight = 2 }) {
  const id = "q-region-containing-point-server";
  const title = "Region Containing Point";

  const random = seedrandom(`${user.email}#${id}`);
  const { cities, regions, groups } = await fetch("data-cities-regions.json").then((r) => r.json());
  const { points } = groups[Math.floor(random() * groups.length)];

  const question = html`
    <p>
      You are the operations manager for World Courier. You have divided your business across ${regions.length}
      franchisees, giving each a region. All couriers from inside the franchisee's region must be picked up by that
      franchisee.
    </p>
    <p>You have new requests from these latitudes and longitudes:</p>
    <table class="table">
      <thead>
        <tr>
          <th>Latitude</th>
          <th>Longitude</th>
        </tr>
      </thead>
      <tbody>
        ${
    points.map(
      ([lat, lon]) =>
        html`<tr>
              <td>${lat}</td>
              <td>${lon}</td>
            </tr>`,
    )
  }
      </tbody>
    </table>

    <details class="my-3">
      <summary>Here are the franchisee numbers and the cities that mark their region's boundary.</summary>
      <table class="table">
        <thead>
          <tr>
            <th>Franchisee</th>
            <th>Cities [Latitude, Longitude]</th>
          </tr>
        </thead>
        <tbody>
          ${
    regions.map(
      (region, i) =>
        html`<tr>
                <td>${i + 1}</td>
                <td>${region.map((city) => html`<div>${city} ${JSON.stringify(cities[city])}</div>`)}</td>
              </tr>`,
    )
  }
        </tbody>
      </table>
    </details>

    <p>Any point inside a region is served by the corresponding franchisee.</p>
    <p>Assume the Earth is flat.</p>
    <p>Write the answer as a sequence of franchisee numbers separated by commas (e.g. "20,9,12,12,3").</p>
    <input class="form-control" id="${id}" name="${id}" />
    <p class="text-muted">
      The franchisee numbers should be in the order of the pickup points. We strip spaces around the commas or
      franchisee numbers before checking. It's OK if multiple points fall into the same franchisee region.
    </p>
  `;

  return { id, title, weight, question, answer: await answer(user) };
}
