Feature: Buzzhive Posts
  As a user
  I want to create and view posts
  So that I can share content with others

Background:
  Given the user is logged in

Scenario: User creates a post
  Given the user is on the feed page
  When the user creates a post with text "Hello Buzzhive"
  And submits the post
  Then the post should appear in the feed

Scenario: Post with empty content is rejected
  Given the user is on the feed page
  When the user submits an empty post
  Then an error "Content is required" should be shown

Scenario: Post with special characters is handled
  Given the user is on the feed page
  When the user submits a post with "<script>alert('xss')</script>"
  Then the post should be created with escaped content

Scenario Outline: Create posts with different lengths
  Given the user is on the feed page
  When the user submits a post with length <length>
  Then the post <result>
  Examples:
    | length | result |
    | 1      | accepted |
    | 5000   | warning  |
    | 10000  | rejected |