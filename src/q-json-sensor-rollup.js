import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import { download } from "./download.js";
import { pick } from "./utils/random.js";

export default async function({ user, weight = 1 }) {
  const id = "q-json-sensor-rollup";
  const title = "JSON: Sensor roll-up analytics";

  const random = seedrandom(`${user.email}#${id}`);

  const sites = ["Plant-01", "Plant-02", "Plant-03", "Lab-East", "Lab-West", "Depot-North", "Depot-South"];
  const deviceTypes = ["boiler", "compressor", "chiller", "condenser", "exchange", "pump"];

  const statusValues = ["ok", "warning", "maintenance", "offline"];

  const records = [];
  const lines = [];

  const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;
  const randomFloat = (min, max, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((min + random() * (max - min)) * factor) / factor;
  };
  const randomDate = (start, end) => new Date(start.getTime() + random() * (end.getTime() - start.getTime()));

  const startDate = new Date("2024-06-01T00:00:00Z");
  const endDate = new Date("2024-08-31T23:59:59Z");

  const recordCount = 480;

  for (let i = 0; i < recordCount; i++) {
    const site = pick(sites, random);
    const deviceType = pick(deviceTypes, random);
    const deviceId = `${deviceType}-${String(randomInt(1, 18)).padStart(3, "0")}`;
    const capturedAt = randomDate(startDate, endDate);
    const status = pick(statusValues, random);
    const temperatureC = randomFloat(45, 95, 2);
    const convertToF = random() < 0.25;
    const temperatureValue = convertToF ? Math.round(((temperatureC * 9) / 5 + 32) * 100) / 100 : temperatureC;
    const temperatureUnit = convertToF ? "F" : "C";
    const pressure = randomFloat(95, 125, 2);
    const humidity = randomFloat(25, 85, 1);
    const vibration = {
      x: randomFloat(0.05, 0.6, 3),
      y: randomFloat(0.05, 0.6, 3),
      z: randomFloat(0.05, 0.6, 3),
    };

    const payload = {
      site,
      device: deviceId,
      captured_at: capturedAt.toISOString(),
      status,
      metrics: {
        temperature: {
          value: temperatureValue,
          unit: temperatureUnit,
        },
        pressure: {
          value: pressure,
          unit: "kPa",
        },
        vibration,
      },
      environmental: {
        humidity: {
          value: humidity,
          unit: "%",
        },
        airflow: randomFloat(18, 40, 2),
      },
      notes: {
        operator: `shift-${randomInt(1, 5)}`,
        calibration_due: randomDate(new Date("2024-09-01T00:00:00Z"), new Date("2024-12-31T00:00:00Z")).toISOString(),
      },
    };

    records.push({
      site,
      deviceType,
      capturedAt,
      status,
      temperatureC,
      temperatureUnit,
      skip: status === "maintenance" || status === "offline",
      payload,
    });
    lines.push(JSON.stringify(payload));
  }

  const blob = new Blob([lines.join("\n")], { type: "application/jsonl" });

  const scenario = {};
  let usableRecords = [];

  while (!usableRecords.length) {
    scenario.site = pick(sites, random);
    scenario.deviceType = pick(deviceTypes, random);

    const windowStart = randomDate(startDate, endDate);
    const windowEnd = new Date(windowStart.getTime() + randomInt(5, 15) * 24 * 60 * 60 * 1000);
    scenario.start = windowStart < endDate ? windowStart : startDate;
    scenario.end = windowEnd < endDate ? windowEnd : endDate;

    usableRecords = records.filter(
      ({ site, deviceType, capturedAt, skip }) =>
        site === scenario.site
        && deviceType === scenario.deviceType
        && !skip
        && capturedAt.getTime() >= scenario.start.getTime()
        && capturedAt.getTime() <= scenario.end.getTime(),
    );
  }

  const expectedAverage = usableRecords.reduce((sum, record) => sum + record.temperatureC, 0) / usableRecords.length;

  const answer = async (value) => {
    if (typeof value === "string") value = value.replace(/[^\d.-]/g, "");
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) throw new Error("Enter the average temperature in °C.");
    if (Math.abs(numeric - expectedAverage) > 0.05) throw new Error("Average temperature does not match cleaned data.");
    return true;
  };

  const formatDate = (date) => date.toISOString().replace(".000Z", "Z").replace(/T/, " ");

  const question = html`
    <div class="mb-3">
      <h2 id="sensor-rollup-for-thermal-watch">Sensor roll-up for ThermalWatch</h2>
      <p>
        ThermalWatch aggregates IoT telemetry from industrial plants. Each device emits a JSON document per minute with
        nested metrics. Operators need a cleaned dataset to monitor temperature drift by equipment type and site.
      </p>
      <p>
        Unfortunately, older firmware reports some temperatures in Fahrenheit while the newer firmware uses Celsius, and
        maintenance events are logged even when the sensor is offline. You must build a script (or use tools such as
        <code>jq</code>, <code>ijson</code>, or pandas) to compute a normalised average temperature for a specific
        device family.
      </p>
      <h3>Steps</h3>
      <ol>
        <li>Stream the JSONL file to avoid loading it fully into memory.</li>
        <li>
          Filter to <strong>${scenario.site}</strong> and devices whose id starts with
          <strong>${scenario.deviceType}</strong>.
        </li>
        <li>
          Restrict the time window to <strong>${formatDate(scenario.start)} UTC</strong> through
          <strong>${formatDate(scenario.end)} UTC</strong>.
        </li>
        <li>Exclude records where <code>status</code> is <code>maintenance</code> or <code>offline</code>.</li>
        <li>Convert all temperature readings to Celsius before aggregating.</li>
        <li>Compute the average temperature to two decimal places.</li>
      </ol>
      <p>
        Download the sensor feed:
        <button class="btn btn-sm btn-outline-primary" type="button" @click=${() => download(blob, `${id}.jsonl`)}>
          ${id}.jsonl
        </button>
      </p>
      <label for="${id}" class="form-label">
        What is the average temperature in °C for ${scenario.deviceType} devices at ${scenario.site} within the
        specified window?
      </label>
      <input class="form-control" id="${id}" name="${id}" required />
      <p class="text-muted">Round to two decimal places.</p>
    </div>
  `;

  return { id, title, weight, question, answer };
}
