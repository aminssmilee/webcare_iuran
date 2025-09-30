<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasCustomId
{
    protected static function bootHasCustomId()
    {
        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = strtoupper(Str::random(6));
            }
        });
    }

    public function getIncrementing() { return false; }
    public function getKeyType() { return 'string'; }
}
