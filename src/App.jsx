import { useState, useEffect } from 'react'
import './App.css'

// 환경 변수에서 API 주소 가져오기, 없으면 기본값 사용
const API_BASE_URL = import.meta.env.VITE_API_URL

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium' })
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  // 할일 목록 조회
  const fetchTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) {
        throw new Error('할일 목록을 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (err) {
      setError(err.message)
      console.error('할일 목록 조회 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 할일 목록 조회
  useEffect(() => {
    fetchTodos()
  }, [])

  // 할일 추가
  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.title.trim()) {
      setError('할일 제목을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '할일 추가에 실패했습니다.')
      }

      const data = await response.json()
      setTodos([...todos, data.todo])
      setNewTodo({ title: '', description: '', priority: 'medium' })
    } catch (err) {
      setError(err.message)
      console.error('할일 추가 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 할일 수정 시작
  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      completed: todo.completed || false,
    })
  }

  // 할일 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  // 할일 수정 저장
  const handleUpdateTodo = async (id) => {
    if (!editData.title.trim()) {
      setError('할일 제목을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '할일 수정에 실패했습니다.')
      }

      const data = await response.json()
      setTodos(todos.map(todo => todo._id === id ? data.todo : todo))
      setEditingId(null)
      setEditData({})
    } catch (err) {
      setError(err.message)
      console.error('할일 수정 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 할일 삭제
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('정말 이 할일을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '할일 삭제에 실패했습니다.')
      }

      setTodos(todos.filter(todo => todo._id !== id))
    } catch (err) {
      setError(err.message)
      console.error('할일 삭제 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 완료 상태 토글
  const handleToggleComplete = async (todo) => {
    const updatedData = {
      ...todo,
      completed: !todo.completed,
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/${todo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '완료 상태 변경에 실패했습니다.')
      }

      const data = await response.json()
      setTodos(todos.map(t => t._id === todo._id ? data.todo : t))
    } catch (err) {
      setError(err.message)
      console.error('완료 상태 변경 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>할일 관리</h1>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        {/* 할일 추가 폼 */}
        <form onSubmit={handleAddTodo} className="todo-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="할일 제목"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="설명 (선택사항)"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="form-textarea"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
              className="form-select"
              disabled={loading}
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '추가 중...' : '할일 추가'}
          </button>
        </form>

        {/* 할일 목록 */}
        <div className="todos-container">
          {loading && todos.length === 0 ? (
            <div className="loading">로딩 중...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">할일이 없습니다. 새로운 할일을 추가해보세요!</div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  {editingId === todo._id ? (
                    // 수정 모드
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="form-input"
                        disabled={loading}
                      />
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="form-textarea"
                        disabled={loading}
                      />
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        className="form-select"
                        disabled={loading}
                      >
                        <option value="low">낮음</option>
                        <option value="medium">보통</option>
                        <option value="high">높음</option>
                      </select>
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateTodo(todo._id)}
                          className="btn btn-save"
                          disabled={loading}
                        >
                          저장
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-cancel"
                          disabled={loading}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <>
                      <div className="todo-content">
                        <input
                          type="checkbox"
                          checked={todo.completed || false}
                          onChange={() => handleToggleComplete(todo)}
                          className="todo-checkbox"
                          disabled={loading}
                        />
                        <div className="todo-info">
                          <h3 className="todo-title">{todo.title}</h3>
                          {todo.description && (
                            <p className="todo-description">{todo.description}</p>
                          )}
                          <div className="todo-meta">
                            <span className={`priority-badge priority-${todo.priority || 'medium'}`}>
                              {todo.priority === 'high' ? '높음' : todo.priority === 'low' ? '낮음' : '보통'}
                            </span>
                            {todo.createdAt && (
                              <span className="todo-date">
                                {new Date(todo.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="todo-actions">
                        <button
                          onClick={() => startEdit(todo)}
                          className="btn btn-edit"
                          disabled={loading}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="btn btn-delete"
                          disabled={loading}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
