import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("plans").del();

  // Only create plans, NO subscriptions
  await knex("plans").insert([
    {
      name: "Basic",
      price: 9.99,
      features: JSON.stringify([
        "10 Projects",
        "5GB Storage",
        "Basic Support",
        "Email Support",
      ]),
      duration_days: 30,
    },
    {
      name: "Pro",
      price: 19.99,
      features: JSON.stringify([
        "50 Projects",
        "50GB Storage",
        "Priority Support",
        "Advanced Analytics",
        "API Access",
      ]),
      duration_days: 30,
    },
    {
      name: "Enterprise",
      price: 49.99,
      features: JSON.stringify([
        "Unlimited Projects",
        "500GB Storage",
        "24/7 Support",
        "Custom Integrations",
        "Dedicated Account Manager",
        "SSO",
      ]),
      duration_days: 30,
    },
  ]);

  console.log(" Plans seeded successfully (no subscriptions created)");
}
