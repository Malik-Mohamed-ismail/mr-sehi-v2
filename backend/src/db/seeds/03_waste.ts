import { db } from '../../config/database.js'
import { production } from '../schema/production.js'

export async function seedWaste() {
  console.log('🌱 Seeding sample production waste data...')
  
  const today = new Date()
  const data = []
  const products = [
    { name: 'دجاج شواية', cost: 15.5 },
    { name: 'لحم حاشي', cost: 45.0 },
    { name: 'أرز بسمتي', cost: 6.0 },
    { name: 'سلطة خضراء', cost: 3.5 },
  ]

  for (let i = 0; i < 20; i++) {
    const p = products[i % products.length]
    // random date within the last 30 days
    const date = new Date(today)
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    
    const qty = 50 + Math.random() * 100
    const wasteGrams = 200 + Math.random() * 3000 // 200g to 3.2kg
    const wasteValue = (wasteGrams / 1000) * p.cost

    data.push({
      production_date: date.toISOString().split('T')[0],
      product_name: p.name,
      produced_kg: qty.toFixed(3),
      waste_grams: wasteGrams.toFixed(3),
      waste_value: wasteValue.toFixed(4),
      unit_cost: p.cost.toFixed(4),
      created_by: '00000000-0000-0000-0000-000000000000'
    })
  }

  await db.insert(production).values(data)
  console.log('✅ Waste data seeded successfully')
  process.exit(0)
}

seedWaste().catch(err => {
  console.error(err)
  process.exit(1)
})
