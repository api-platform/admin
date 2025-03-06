<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;


#[ApiResource]
#[ORM\Entity]
class Book
{
    /** The ID of this book */
    #[ORM\Id]
    #[ORM\Column]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    /** The ISBN of this book (or null if doesn't have one) */
    #[ORM\Column(nullable: true)]
    public ?string $isbn = null;

    /** The title of this book */
    #[ORM\Column]
    #[Assert\NotBlank]
    public string $title = '';

    /** The description of this book */
    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    public string $description = '';

    /** The author of this book */
    #[ORM\Column]
    #[Assert\NotBlank]
    public string $author = '';

    /** The publication date of this book */
    #[ORM\Column]
    #[Assert\NotNull]
    public ?\DateTimeImmutable $publicationDate = null;

    /** @var Review[] Available reviews for this book */
    #[ORM\OneToMany(mappedBy: 'book', targetEntity: Review::class, cascade: ['persist', 'remove'])]
    public iterable $reviews;

    public function __construct()
    {
        $this->reviews = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }
}
