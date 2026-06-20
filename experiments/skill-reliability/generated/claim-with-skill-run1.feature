Feature: Buzzhive Posts
  As a user
  I want to create and view posts
  So that I can share content with others

Background:
  Given the user is logged in as an authenticated user

Scenario: User creates a valid post
  Given the user is on the feed page
  When the user enters text "Hello Buzzhive"
  And submits the post
  Then the post should be created with status "Published"
  And the post should appear in the feed with correct author

Scenario: Post with empty content is rejected
  Given the user is on the feed page
  When the user submits a post without content
  Then the post should not be created
  And an error "Content is required" should be shown

Scenario: Post with XSS attempt is sanitized
  Given the user is on the feed page
  When the user submits a post with content "<script>alert('xss')</script>"
  Then the post should be created with escaped content
  And no script should execute

Scenario Outline: Create posts with different content lengths
  Given the user is on the feed page
  When the user submits a post with length <length>
  Then the post <result>
  Examples:
    | length | result   |
    | 1      | accepted |
    | 5000   | warning  |
    | 10000  | rejected |