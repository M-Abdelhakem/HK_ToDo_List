/**
 * Centralized API connection layer for the Todo List application
 * Handles all backend communication with the Flask backend
 */

// Base API configuration
const API_BASE_URL = "http://localhost:5001"

// Token key for localStorage
const TOKEN_KEY = "access_token"

// Standard response format
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Helper function to get token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return getToken() !== null
}

// Helper function to store token in localStorage
function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

// Helper function to remove token from localStorage
function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// Centralized error handler
function handleError(error: any): string {
  if (error.response?.status === 401) {
    // Unauthorized - remove token
    // NOTE: We do NOT redirect here to avoid infinite redirect loops.
    // Components should handle 401 errors and redirect themselves using router.push()
    // Using window.location.href causes full page reloads and can create redirect loops
    removeToken()
    // Use backend error message if available (e.g., for wrong password/email during login)
    // Otherwise show generic session expired message
    return error.response?.data?.error || "Session expired. Please login again."
  }

  if (error.response?.status === 403) {
    return "You do not have permission to perform this action."
  }

  if (error.response?.status === 400) {
    return error.response?.data?.error || "Validation error. Please check your input."
  }

  if (error.response?.status === 404) {
    return "Resource not found."
  }

  if (error.response?.status === 500) {
    return error.response?.data?.error || "Server error, please try again."
  }

  if (error.message === "Failed to fetch" || error.message === "NetworkError") {
    return "Network error, please check your connection."
  }

  return error.response?.data?.error || error.message || "An unexpected error occurred."
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle non-2xx responses
      const errorMessage = handleError({
        response: {
          status: response.status,
          data: data,
        },
      })

      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      data: data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: handleError(error),
    }
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param name User's full name
 * @param email User's email address
 * @param password User's password
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse> {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })

  // Note: Registration doesn't return a token, user needs to login
  return response
}

/**
 * Login user
 * @param email User's email address
 * @param password User's password
 */
export async function login(email: string, password: string): Promise<ApiResponse> {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  // Store token if login successful
  if (response.success && response.data?.access_token) {
    storeToken(response.data.access_token)
  }

  return response
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResponse> {
  return apiRequest("/auth/me")
}

/**
 * Logout user
 */
export function logout(): ApiResponse {
  removeToken()
  return { success: true }
}

// ============================================
// LISTS FUNCTIONS
// ============================================

/**
 * Get all lists for the authenticated user
 */
export async function getLists(): Promise<ApiResponse> {
  return apiRequest("/lists")
}

/**
 * Create a new list
 * @param title List title
 */
export async function createList(title: string): Promise<ApiResponse> {
  return apiRequest("/lists", {
    method: "POST",
    body: JSON.stringify({ title }),
  })
}

/**
 * Update an existing list
 * @param listId ID of the list to update
 * @param title Optional new title
 * @param position Optional new position
 */
export async function updateList(
  listId: number,
  title?: string,
  position?: number
): Promise<ApiResponse> {
  const body: any = {}
  if (title !== undefined) body.title = title
  if (position !== undefined) body.position = position

  return apiRequest(`/lists/${listId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

/**
 * Delete a list
 * @param listId ID of the list to delete
 */
export async function deleteList(listId: number): Promise<ApiResponse> {
  return apiRequest(`/lists/${listId}`, {
    method: "DELETE",
  })
}

// ============================================
// ITEMS FUNCTIONS
// ============================================

/**
 * Get all items for a specific list (with nested children)
 * @param listId ID of the list
 */
export async function getListItems(listId: number): Promise<ApiResponse> {
  return apiRequest(`/lists/${listId}/items`)
}

/**
 * Create a new item
 * @param listId ID of the list to add item to
 * @param title Item title
 * @param parentId Optional parent item ID
 */
export async function createItem(
  listId: number,
  title: string,
  parentId?: number
): Promise<ApiResponse> {
  const body: any = { title }
  if (parentId !== undefined) body.parent_id = parentId

  return apiRequest(`/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/**
 * Update an existing item
 * @param itemId ID of the item to update
 * @param updates Object with optional fields to update
 */
export async function updateItem(
  itemId: number,
  updates: {
    title?: string
    completed?: boolean
    position?: number
    list_id?: number
    parent_id?: number | null
  }
): Promise<ApiResponse> {
  const body: any = {}
  if (updates.title !== undefined) body.title = updates.title
  if (updates.completed !== undefined) body.completed = updates.completed
  if (updates.position !== undefined) body.position = updates.position
  if (updates.list_id !== undefined) body.list_id = updates.list_id
  if ('parent_id' in updates) body.parent_id = updates.parent_id

  return apiRequest(`/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

/**
 * Delete an item
 * @param itemId ID of the item to delete
 */
export async function deleteItem(itemId: number): Promise<ApiResponse> {
  return apiRequest(`/items/${itemId}`, {
    method: "DELETE",
  })
}

