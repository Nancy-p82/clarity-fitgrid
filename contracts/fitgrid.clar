;; FitGrid - Social Fitness Connection Platform

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-user-exists (err u101))
(define-constant err-invalid-params (err u102))
(define-constant err-user-not-found (err u103))

;; Data Variables
(define-map user-profiles
  principal
  {
    name: (string-ascii 50),
    activity-type: (string-ascii 20),
    experience-level: uint,
    goals: (string-ascii 100),
    reputation: uint,
    total-activities: uint
  }
)

(define-map user-activities
  { user: principal, activity-id: uint }
  {
    activity-type: (string-ascii 20),
    duration: uint,
    timestamp: uint
  }
)

(define-data-var activity-counter uint u0)

;; Public Functions
(define-public (create-profile (name (string-ascii 50)) (activity-type (string-ascii 20)) (experience-level uint) (goals (string-ascii 100)))
  (let ((user tx-sender))
    (if (is-some (get-user-profile user))
      err-user-exists
      (ok (map-set user-profiles
        user
        {
          name: name,
          activity-type: activity-type,
          experience-level: experience-level,
          goals: goals,
          reputation: u0,
          total-activities: u0
        }
      ))
    )
  )
)

(define-public (log-activity (duration uint) (activity-type (string-ascii 20)) (reputation-points uint))
  (let
    (
      (user tx-sender)
      (current-activity-id (var-get activity-counter))
      (user-data (unwrap! (get-user-profile user) err-user-not-found))
    )
    (map-set user-activities
      { user: user, activity-id: current-activity-id }
      {
        activity-type: activity-type,
        duration: duration,
        timestamp: block-height
      }
    )
    (var-set activity-counter (+ current-activity-id u1))
    (ok (map-set user-profiles
      user
      (merge user-data
        {
          reputation: (+ (get reputation user-data) reputation-points),
          total-activities: (+ (get total-activities user-data) u1)
        }
      ))
    )
  )
)

;; Read Only Functions
(define-read-only (get-user-profile (user principal))
  (ok (map-get? user-profiles user))
)

(define-read-only (get-user-activities (user principal))
  (ok (map-get? user-activities { user: user, activity-id: (var-get activity-counter) }))
)

(define-read-only (find-matches (user principal))
  (let ((user-data (unwrap! (get-user-profile user) err-user-not-found)))
    (ok (get activity-type user-data))
  )
)
