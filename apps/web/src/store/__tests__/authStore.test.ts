import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.logout()
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.accessToken).toBeNull()
  })

  it('should login with user and tokens', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      profileName: 'Test User',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    act(() => {
      result.current.login(mockUser, 'access-token', 'refresh-token')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.accessToken).toBe('access-token')
    expect(result.current.refreshToken).toBe('refresh-token')
  })

  it('should logout and clear state', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    act(() => {
      result.current.login(mockUser, 'access-token', 'refresh-token')
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.accessToken).toBeNull()
  })

  it('should set user', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
  })
})
