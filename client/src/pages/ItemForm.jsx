import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }
const statuses = ['lost', 'found', 'claimed']
const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other']

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false
    async function loadItem() {
      setError('')
      try {
        const res = await api.get(`/items/${id}`)
        if (!cancelled) {
          const { title, status, category, location, description } = res.data.item
          setForm({ title, status, category, location, description })
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load item')
      }
    }

    loadItem()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/items/${id}`, form)
      } else {
        await api.post('/items', form)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          placeholder="Title"
          aria-label="Title"
          value={form.title}
          onChange={onChange}
          required
        />
        <select className="input" name="status" aria-label="Status" value={form.status} onChange={onChange}>
          {statuses.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <select className="input" name="category" aria-label="Category" value={form.category} onChange={onChange}>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
        <input
          className="input"
          name="location"
          placeholder="Location (optional)"
          aria-label="Location (optional)"
          value={form.location}
          onChange={onChange}
        />
        <textarea
          className="input"
          name="description"
          placeholder="Description (optional)"
          aria-label="Description (optional)"
          value={form.description}
          onChange={onChange}
          rows={4}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
