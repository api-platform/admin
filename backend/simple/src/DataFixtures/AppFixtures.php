<?php

namespace App\DataFixtures;

use App\Entity\Book;
use App\Entity\Review;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as Faker;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Faker::create();
        $books = [];
        for ($i = 0; $i < 100; $i++) {
            $book = new Book();
            $book
                ->setTitle($faker->sentence)
                ->setAuthor($faker->name)
                ->setDescription($faker->text)
                ->setIsbn($faker->isbn13)
                ->setPublicationDate($faker->dateTime);
            $manager->persist($book);
            $books[] = $book;
        }

        $manager->flush();

        for ($i = 0; $i < 500; $i++) {
            $review = new Review();
            $review
                ->setAuthor($faker->name)
                ->setBody($faker->text)
                ->setPublicationDate($faker->dateTime)
                ->setRating($faker->numberBetween(1, 5))
                ->setBook($books[$faker->numberBetween(0, 99)]);
            $manager->persist($review);
        }

        $manager->flush();
    }
}
