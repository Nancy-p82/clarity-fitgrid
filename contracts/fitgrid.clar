;; FitGrid - Social Fitness Connection Platform

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-user-exists (err u101))
(define-constant err-invalid-params (err u102))
(define-constant err-user-not-found (err u103))
(define-constant err-invalid-activity-type (err u104))
(define-constant err-invalid-experience-level (err u105))

;; Valid activity types
(define-constant valid-activity-types (list 
  "Running" "Cycling" "Swimming" "Weightlifting" "Yoga"
))

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

;; Private Functions
(define-private (is-valid-activity-type (activity-type (string-ascii 20)))
  (fold and true (map (lambda (valid-type) (is-eq activity-type valid-type)) valid-activity-types))
)

(define-private (is-valid-experience-level (level uint))
  (<= level u5)
)

;; Public Functions
(define-public (create-profile (name (string-ascii 50)) (activity-type (string-ascii 20)) (experience-level uint) (goals (string-ascii 100)))
  (let ((user tx-sender))
    (asserts! (is-valid-activity-type activity-type) err-invalid-activity-type)
    (asserts! (is-valid-experience-level experience-level) err-invalid-experience-level)
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
    (asserts! (is-valid-activity-type activity-type) err-invalid-activity-type)
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

(define-read-only (get-user-activities (user principal) (page uint))
  (let ((start-id (if (>= (var-get activity-counter) (* page u10))
                   (- (var-get activity-counter) (* page u10))
                   u0)))
    (ok (map-get? user-activities { user: user, activity-id: start-id }))
  )
)

(define-read-only (find-matches (user principal))
  (let ((user-data (unwrap! (get-user-profile user) err-user-not-found)))
    (ok {
      activity-type: (get activity-type user-data),
      experience-level: (get experience-level user-data)
    })
  )
)

(define-read-only (get-valid-activity-types)
  (ok valid-activity-types)
)
