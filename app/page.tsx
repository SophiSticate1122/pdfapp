function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [passErr, setPassErr] = useState('')
  const [resetEmail, setResetEmail] = useState<string | null>(null)

  const ADMIN_PASSWORD = 'pdfadmin2026'

  useEffect(() => {
    if (authed) fetchUsers()
  }, [authed])

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false) })
  }

  const handleLogin = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setAuthed(true)
    } else {
      setPassErr('Incorrect password. Try again.')
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return
    setActionLoading(userId + 'delete')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert('✅ User deleted')
      fetchUsers()
    } catch (e: any) { alert('Error: ' + e.message) }
    setActionLoading(null)
  }

  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Send password reset email to ${email}?`)) return
    setActionLoading(email + 'reset')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert('✅ Password reset email sent to ' + email)
    } catch (e: any) { alert('Error: ' + e.message) }
    setActionLoading(null)
  }

  const handleAction = async (action: string, userId: string, subscriptionId: string | null) => {
    const confirmMsg = action === 'refund'
      ? 'Issue a refund AND cancel this subscription? This cannot be undone.'
      : 'Cancel this subscription? This cannot be undone.'
    if (!window.confirm(confirmMsg)) return
    setActionLoading(userId + action)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, subscriptionId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert('✅ ' + data.message)
      fetchUsers()
    } catch (e: any) { alert('Error: ' + e.message) }
    setActionLoading(null)
  }

  const handleUpgrade = async (userId: string) => {
    if (!window.confirm('Manually upgrade this user to Pro?')) return
    setActionLoading(userId + 'upgrade')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', userId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert('✅ User upgraded to Pro')
      fetchUsers()
    } catch (e: any) { alert('Error: ' + e.message) }
    setActionLoading(null)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'PDFs Used', 'Joined']
    const rows = users.map(u => [
      u.name, u.email, u.plan,
      u.pdf_used || 0,
      new Date(u.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows]
      .map(r => r.map((v: any) => `"${v}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const badge = (p: string) =>
    p === 'free' ? 'bg-gray-100 text-gray-600' :
    p === 'monthly' ? 'bg-blue-100 text-blue-700' :
    'bg-yellow-100 text-yellow-700'

  if (!authed) return (
    <Modal onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admin Access</h2>
            <p className="text-sm text-gray-500">Enter your admin password to continue</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={adminPass}
              onChange={e => { setAdminPass(e.target.value); setPassErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          </div>
          {passErr && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{passErr}</p>}
          <button onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Access Admin Panel
          </button>
        </div>
      </div>
    </Modal>
  )

  return (
    <Modal onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin — User List</h2>
              <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
            </div>
          </div>
          <button onClick={exportToCSV}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition">
            ⬇️ Export CSV
          </button>
        </div>
        {loading
          ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400 w-6 h-6" /></div>
          : users.length === 0
          ? <p className="text-center text-gray-400 py-8 text-sm">No users yet.</p>
          : <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.id} className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{u.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />{u.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Joined {new Date(u.created_at).toLocaleDateString()} · {u.pdf_used || 0} PDFs used
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${badge(u.plan)}`}>
                      {u.plan === 'free' ? 'Free' : u.plan === 'monthly' ? 'Monthly Pro' : 'Yearly Pro'}
                    </span>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Reset Password */}
                    <button
                      onClick={() => handleResetPassword(u.email)}
                      disabled={!!actionLoading}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition disabled:opacity-50">
                      {actionLoading === u.email + 'reset' ? '...' : '🔑 Reset Password'}
                    </button>
                    {/* Upgrade to Pro */}
                    {u.plan === 'free' && (
                      <button
                        onClick={() => handleUpgrade(u.id)}
                        disabled={!!actionLoading}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50">
                        {actionLoading === u.id + 'upgrade' ? '...' : '⭐ Upgrade'}
                      </button>
                    )}
                    {/* Cancel subscription */}
                    {u.plan !== 'free' && (
                      <button
                        onClick={() => handleAction('cancel', u.id, u.stripe_subscription_id)}
                        disabled={!!actionLoading}
                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-200 transition disabled:opacity-50">
                        {actionLoading === u.id + 'cancel' ? '...' : '⛔ Cancel'}
                      </button>
                    )}
                    {/* Refund */}
                    {u.plan !== 'free' && (
                      <button
                        onClick={() => handleAction('refund', u.id, u.stripe_subscription_id)}
                        disabled={!!actionLoading}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200 transition disabled:opacity-50">
                        {actionLoading === u.id + 'refund' ? '...' : '💸 Refund'}
                      </button>
                    )}
                    {/* Delete user */}
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      disabled={!!actionLoading}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">
                      {actionLoading === u.id + 'delete' ? '...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </Modal>
  )
}