import { renderHook, act } from '@testing-library/react'
import { useBookmarkStore } from '../bookmarkStore'

describe('bookmarkStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with empty bookmarks', () => {
    const { result } = renderHook(() => useBookmarkStore())
    expect(result.current.bookmarks).toEqual([])
  })

  it('should add a bookmark', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const mockExperience = {
      id: 1,
      name: '과학관 과학 체험',
      institution: '국립과학관',
      price: 15000,
      ageGroup: '6-10세',
      rating: 4.8,
      bookmarkedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.addBookmark(mockExperience)
    })

    expect(result.current.bookmarks).toHaveLength(1)
    expect(result.current.bookmarks[0]).toEqual(mockExperience)
  })

  it('should not add duplicate bookmarks', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const mockExperience = {
      id: 1,
      name: '과학관 과학 체험',
      institution: '국립과학관',
      price: 15000,
      ageGroup: '6-10세',
      rating: 4.8,
      bookmarkedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.addBookmark(mockExperience)
      result.current.addBookmark(mockExperience)
    })

    expect(result.current.bookmarks).toHaveLength(1)
  })

  it('should remove a bookmark', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const mockExperience = {
      id: 1,
      name: '과학관 과학 체험',
      institution: '국립과학관',
      price: 15000,
      ageGroup: '6-10세',
      rating: 4.8,
      bookmarkedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.addBookmark(mockExperience)
      result.current.removeBookmark(1)
    })

    expect(result.current.bookmarks).toHaveLength(0)
  })

  it('should check if experience is bookmarked', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const mockExperience = {
      id: 1,
      name: '과학관 과학 체험',
      institution: '국립과학관',
      price: 15000,
      ageGroup: '6-10세',
      rating: 4.8,
      bookmarkedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.addBookmark(mockExperience)
    })

    expect(result.current.isBookmarked(1)).toBe(true)
    expect(result.current.isBookmarked(2)).toBe(false)
  })
})
